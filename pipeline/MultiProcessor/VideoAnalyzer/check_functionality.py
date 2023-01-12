import argparse
import cv2
import os
# limit the number of cpus used by high performance libraries
os.environ["OMP_NUM_THREADS"] = "1"
os.environ["OPENBLAS_NUM_THREADS"] = "1"
os.environ["MKL_NUM_THREADS"] = "1"
os.environ["VECLIB_MAXIMUM_THREADS"] = "1"
os.environ["NUMEXPR_NUM_THREADS"] = "1"

import sys
import numpy as np
from pathlib import Path
import torch
import torch.backends.cudnn as cudnn
from numpy import random


FILE = Path(__file__).resolve()
ROOT = FILE.parents[0]  # yolov5 strongsort root directory
WEIGHTS = ROOT / 'weights'

if str(ROOT) not in sys.path:
    sys.path.append(str(ROOT))  # add ROOT to PATH
if str(ROOT / 'yolov7') not in sys.path:
    sys.path.append(str(ROOT / 'yolov7'))  # add yolov5 ROOT to PATH
if str(ROOT / 'strong_sort') not in sys.path:
    sys.path.append(str(ROOT / 'strong_sort'))  # add strong_sort ROOT to PATH
ROOT = Path(os.path.relpath(ROOT, Path.cwd()))  # relative

from yolov7.models.experimental import attempt_load
from yolov7.utils.datasets import LoadImages, LoadStreams, letterbox
from yolov7.utils.general import (check_img_size, non_max_suppression, scale_coords, check_requirements, cv2,
                                  check_imshow, xyxy2xywh, increment_path, strip_optimizer, colorstr, check_file)
from yolov7.utils.torch_utils import select_device, time_synchronized
from yolov7.utils.plots import plot_one_box
from strong_sort.utils.parser import get_config
from strong_sort.strong_sort import StrongSORT



VID_FORMATS = 'asf', 'avi', 'gif', 'm4v', 'mkv', 'mov', 'mp4', 'mpeg', 'mpg', 'ts', 'wmv'  # include video suffixes


def load_yolov7_model(yolo_weights = 'yolov7x/best.pt'):
    # Load model
    device = "cpu"
    device = select_device(device)
    
    model = attempt_load(Path(yolo_weights), map_location=device)  # load FP32 model
    names, = model.names,
    stride = model.stride.max()  # model stride
    imgsz = (640, 640)
    imgsz = check_img_size(imgsz[0], s=stride.cpu().numpy())  # check image size 

    return model, names, stride

def load_strongsort_model(config_strongsort = 'strong_sort/configs/strong_sort.yaml', strong_sort_weights = 'strong_sort/osnet_x0_25_msmt17.pt'):
    # initialize StrongSORT
    cfg = get_config()
    cfg.merge_from_file(config_strongsort)
    device = 'cpu'
    device = select_device(device)
    half = False
    # Create as many strong sort instances as there are video sources
    strongsort_list = []
    for i in range(1):
        strongsort_list.append(
            StrongSORT(
                strong_sort_weights,
                device,
                half,
                max_dist=cfg.STRONGSORT.MAX_DIST,
                max_iou_distance=cfg.STRONGSORT.MAX_IOU_DISTANCE,
                max_age=cfg.STRONGSORT.MAX_AGE,
                n_init=cfg.STRONGSORT.N_INIT,
                nn_budget=cfg.STRONGSORT.NN_BUDGET,
                mc_lambda=cfg.STRONGSORT.MC_LAMBDA,
                ema_alpha=cfg.STRONGSORT.EMA_ALPHA,

            )
        )
        strongsort_list[i].model.warmup()

    return strongsort_list, cfg


def process_video(names, stride, cfg, strongsort_list, model, source, save_vid, show_vid, start_time, end_time):

    cap = cv2.VideoCapture('1.mp4')
    fps = cap.get(cv2.CAP_PROP_FPS)
    start_frame = int(start_time*fps)
    end_frame = int(end_time*fps)
    cap.set(cv2.CAP_PROP_POS_FRAMES, start_frame - 1)

    colors = [[random.randint(0, 255) for _ in range(3)] for _ in names]



    while True:
        
        res, frame = cap.read()
        print('Important: ', cap.get(cv2.CAP_PROP_POS_FRAMES))
        if cap.get(cv2.CAP_PROP_POS_FRAMES) > end_frame:
            print('End of Desired Video')
            break
        # cv2.imshow('img', frame)
        # cv2.waitKey(0)
        if res == True:
            imgsz = (640,640)
            outputs = [None] * 1

            # Run tracking
            dt, seen = [0.0, 0.0, 0.0, 0.0], 0
            device = ''
            device = select_device(device)
            s = ''
            # -------------------------
            im0 =  frame

            img = letterbox(im0, new_shape = imgsz)[0]
            # Convert
            img = np.ascontiguousarray(img[:, :, ::-1].transpose(2, 0, 1))
            t1 = time_synchronized()

            img = torch.from_numpy(img).to(device)
            img = img.float()  # uint8 to fp16/32
            img /= 255.0  # 0 - 255 to 0.0 - 1.0
            if img.ndimension() == 3:
                img = img.unsqueeze(0)
            im = 0
            im = img
            t2 = time_synchronized()
            dt[0] += t2 - t1

            with torch.no_grad():
                pred = model(im)
            t3 = time_synchronized()
            dt[1] += t3 - t2

            # Apply NMS
            pred = non_max_suppression(pred[0], 0.25, 0.45, None, False)
            dt[2] += time_synchronized() - t3
            
            # Process detections
            for i, det in enumerate(pred):  # detections per image

                if det is not None and len(det):
                    # import pdb; pdb.set_trace()
                    # Rescale boxes from img_size to im0 size
                    det[:, :4] = scale_coords(im.shape[2:], det[:, :4], im0.shape).round()

                    # Print results
                    for c in det[:, -1].unique():
                        n = (det[:, -1] == c).sum()  # detections per class
                        s += f"{n} {names[int(c)]}{'s' * (n > 1)}, "  # add to string

                    xywhs = xyxy2xywh(det[:, 0:4])
                    confs = det[:, 4]
                    clss = det[:, 5]

                    # pass detections to strongsort
                    t4 = time_synchronized()
                    outputs[i] = strongsort_list[i].update(xywhs.cpu(), confs.cpu(), clss.cpu(), im0)
                    t5 = time_synchronized()
                    dt[3] += t5 - t4

                    # draw boxes for visualization
                    if len(outputs[i]) > 0:
                        for j, (output, conf) in enumerate(zip(outputs[i], confs)):

                            bboxes = output[0:4]
                            id = output[4]
                            cls = output[5]


                            if save_vid or show_vid:  # Add bbox to image
                                c = int(cls)  # integer class
                                id = int(id)  # integer id
                                hide_conf = False
                                hide_labels = False
                                hide_class = False
                                label = None if hide_labels else (f'{id} {names[c]}' if hide_conf else \
                                    (f'{id} {conf:.2f}' if hide_class else f'{id} {names[c]} {conf:.2f}'))
                                plot_one_box(bboxes, im0, label=label, color=colors[int(cls)], line_thickness=2)

                    print(f'{s}Done. YOLO:({t3 - t2:.3f}s), StrongSORT:({t5 - t4:.3f}s)')

                else:
                    strongsort_list[i].increment_ages()
                    print('No detections')

                # Stream results
                if show_vid:
                    cv2.imshow('img', im0)
                    cv2.waitKey(0)  # 1 millisecond
        else:
            break

if __name__ == "__main__":

    model, names, stride =  load_yolov7_model(yolo_weights = 'yolov7x/best.pt')
    strongsort_list, cfg = load_strongsort_model(config_strongsort = 'strong_sort/configs/strong_sort.yaml', strong_sort_weights = 'strong_sort/osnet_x0_25_msmt17.pt')
    process_video(names, stride, cfg, strongsort_list, model, source = '1.png', save_vid = True, show_vid = True, start_time=10, end_time=11)


    # run(source='1.mp4', yolo_weights=['yolov7x/best.pt'], show_vid=False, save_vid=False)