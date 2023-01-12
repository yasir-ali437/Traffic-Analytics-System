from analyzer_params import *

from typing import List, Dict
import numpy as np
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
# import torch.backends.cudnn as cudnn
from numpy import random
import json
from datetime import timedelta
from dateutil import parser

sys.path.append('MultiProcessor/VideoAnalyzer/yolov7')  # add yolov7 ROOT to PATH

from yolov7.models.experimental import attempt_load
from yolov7.utils.datasets import letterbox
from yolov7.utils.general import (check_img_size, non_max_suppression, scale_coords, cv2,
                                    xyxy2xywh)
from yolov7.utils.torch_utils import select_device
from yolov7.utils.plots import plot_one_box
from strong_sort.utils.parser import get_config
from strong_sort.strong_sort import StrongSORT

from shapely.geometry import Polygon
import time

class TrackVideo():
    def __init__(self, shared_lock, video_path: str, meta_data_time: Dict[str, int], meta_data_region: Dict[str, List], flags: Dict[str, bool], device="cuda:0") -> None:
        self.video_path = video_path
        self.flags = flags
        self.shared_lock = shared_lock
        self.yolo_weights = YOLO_WEIGHTS
        self.KEEP_PROCESSING = True
        self.config_strongsort = CONFIG_STRONGSORT
        self.strong_sort_weights = STRONG_SORT
        self.show_vid = flags['show_vid']
        self.frame_count = 0
        self.start_time = parser.parse(meta_data_time['start_time'])
        self.end_time = parser.parse(meta_data_time['end_time'])
        self.final_iou_list = []
        self.tracking_dict = {}
        self.region_dict = meta_data_region
        self.current_frame = 0
        self.current_time = 0
        # Load model
        print("is cuda available?", torch.cuda.is_available())
        self.device = select_device(device)
        self.model = attempt_load(Path(self.yolo_weights), map_location=self.device)  # load FP32 model
        
        self.names, = self.model.names,
        self.colors = [[random.randint(0, 255) for _ in range(3)] for _ in self.names]
        self.stride = self.model.stride.max()  # model stride
        self.imgsz = (640, 640)
        imgsz = check_img_size(self.imgsz[0], s=self.stride.cpu().numpy())  # check image size 
        # initialize StrongSORT
        self.cfg = get_config()
        self.cfg.merge_from_file(self.config_strongsort)
        half = False
        # Create as many strong sort instances as there are video sources
        self.strongsort = StrongSORT(
                    self.strong_sort_weights,
                    self.device,
                    half,
                    max_dist=self.cfg.STRONGSORT.MAX_DIST,
                    max_iou_distance=self.cfg.STRONGSORT.MAX_IOU_DISTANCE,
                    max_age=self.cfg.STRONGSORT.MAX_AGE,
                    n_init=self.cfg.STRONGSORT.N_INIT,
                    nn_budget=self.cfg.STRONGSORT.NN_BUDGET,
                    mc_lambda=self.cfg.STRONGSORT.MC_LAMBDA,
                    ema_alpha=self.cfg.STRONGSORT.EMA_ALPHA,

            )
        self.strongsort.model.warmup()
        
    def frame_preprocessing(self, frame): 
        im0 =  frame
        img = letterbox(im0, new_shape = self.imgsz)[0]
        # Convert
        img = np.ascontiguousarray(img[:, :, ::-1].transpose(2, 0, 1))        

        img = torch.from_numpy(img).to(self.device)
        img = img.float()  # uint8 to fp16/32
        img /= 255.0  # 0 - 255 to 0.0 - 1.0
        if img.ndimension() == 3:
            img = img.unsqueeze(0)
        im = 0
        im = img
        with torch.no_grad():
            pred = self.model(im)        

        # Apply NMS
        pred = non_max_suppression(pred[0], 0.25, 0.45, None, False)
        return pred, im0, im

    def frame_detection_and_tracking(self, pred, im0, im):
        # Process detections
        s= ''
        if len(pred)>0:
            if pred[0] is not None and len(pred[0]):
                # Rescale boxes from img_size to im0 size
                pred[0][:, :4] = scale_coords(im.shape[2:], pred[0][:, :4], im0.shape).round()
                # Print results
                for c in pred[0][:, -1].unique():
                    n = (pred[0][:, -1] == c).sum()  # detections per class
                    s += f"{n} {self.names[int(c)]}{'s' * (n > 1)}, "  # add to string

                xywhs = xyxy2xywh(pred[0][:, 0:4])
                confs = pred[0][:, 4]
                clss = pred[0][:, 5]
                # pass detections to strongsort
                outputs = self.strongsort.update(xywhs.cpu(), confs.cpu(), clss.cpu(), im0)
                # draw boxes for visualization
                if len(outputs) > 0:
                    for _, (output, conf) in enumerate(zip(outputs, confs)):
                        bboxes = output[0:4]
                        # iou = self.bb_intersection_over_union(bboxes, np.array([255, 400, 755, 700]))
                        id = output[4]
                        cls = output[5]
                        for region in self.region_dict:
                            self.iou_append(bboxes, region, id, cls)
                        if  self.show_vid:  # Add bbox to image
                            c = int(cls)  # integer class
                            id = int(id)  # integer id
                            hide_conf = False
                            hide_labels = False
                            hide_class = False
                            label = None if hide_labels else (f'{id} {self.names[c]}' if hide_conf else \
                                (f'{id} {conf:.2f}' if hide_class else f'{id} {self.names[c]} {conf:.2f}'))

                            plot_one_box(bboxes, im0, label=label, color=self.colors[int(cls)], line_thickness=2)                            
                            for region in self.region_dict:
                                cv2.polylines(im0, [np.array(self.region_dict[region])], True, (255,255,255),10)                            
            else:
                self.strongsort.increment_ages()
                # print('No detections')
            # Stream results
            if self.show_vid:
                cv2.imshow('video-output', cv2.resize(im0, (1920, 1080)))
                cv2.waitKey(1)  # 1 millisecond

    def process_video(self, current_queue):        
        cap = cv2.VideoCapture(self.video_path)        
        fps = cap.get(cv2.CAP_PROP_FPS)
        while self.KEEP_PROCESSING:
            res, frame = cap.read()
            if res:
                # if self.current_time > 4: #TODO: remove this
                #     break
                self.current_frame  = cap.get(cv2.CAP_PROP_POS_FRAMES)         
                self.current_time = self.current_frame/fps

                print("*"*30)
                print("Time elapsed", self.current_time, "sec")
                print("*"*30)
                
                t = time.time()
                
                pred, im0, im = self.frame_preprocessing(frame)

                print("%"*5, "yolo:","%*"*5)
                print( time.time() - t)
                print("%"*30)
                
                self.show_vid = self.get_visualize_flag(current_queue)
                self.KEEP_PROCESSING = self.get_processing_flag(current_queue)
                
                t = time.time()              

                self.frame_detection_and_tracking(pred, im0, im)
                
                print("%"*5, "tracker:","%*"*5)
                print( time.time() - t)
                print("%"*30)
                
            else:
                break        
            
        if self.show_vid:
            cv2.destroyWindow('video-output')

        self.add_data(current_queue)
        return self.final_iou_list

    def bb_intersection_over_union(self, boxA, boxB):
        # determine the (x, y)-coordinates of the intersection rectangle        
        detection = Polygon([(boxA[0], boxA[1]), (boxA[0], boxA[3]), (boxA[2], boxA[3]), (boxA[2], boxA[1])])
        region = Polygon(boxB)
        intersect = detection.intersection(region).area
        union = detection.union(region).area
        return intersect / union

    def iou_append(self, track_bbox, region, id, cls):

        if self.bb_intersection_over_union(track_bbox, self.region_dict[region]) >= IOU_THRESH:

            if id in self.tracking_dict:
                 if self.tracking_dict[id][1] != region:
                    # now append in final list with
                    temp = {
                        "id":id,
                        "cls":cls,
                        "start_region": self.tracking_dict[id][1],
                        "start_time": self.tracking_dict[id][2],
                        "end_time":(self.start_time + timedelta(seconds = self.current_time)).strftime("%Y-%m-%d %H:%M:%S"),
                        "end_region":region
                    }
                    self.final_iou_list.append(temp)
                    del self.tracking_dict[id]
            else:
                self.tracking_dict[id] = [cls, region, (self.start_time + timedelta(seconds = self.current_time)).strftime("%Y-%m-%d %H:%M:%S")]

    def get_visualize_flag(self, current_queue):
        with self.shared_lock:
            for vid_data in list(current_queue._getvalue()):
                if vid_data[0] == self.video_path:
                    if vid_data[1] == 0:
                        if self.show_vid == True:
                            cv2.destroyWindow('video-output')

                        return False
                    else:
                        return True
    def get_processing_flag(self, current_queue):
        with self.shared_lock:
            for vid_data in list(current_queue._getvalue()):
                if vid_data[0] == self.video_path:
                    return vid_data[3]                  
            return True
                                
    def add_data(self, current_queue):
        with self.shared_lock:
            temp = list(current_queue._getvalue())
            current_queue.clear()
            for current_vid_data in temp: #format [filename, show_vid, analyzed_data]
                if current_vid_data[0] == self.video_path:
                    current_vid_data[2].data = self.final_iou_list
                current_queue.add(current_vid_data)




        
if __name__ == "__main__":
    video_path = '1.mp4'
    obj = TrackVideo(video_path = video_path, meta_data_time = {'start_time' : 25, 'end_time' : 35}, meta_data_region= {'region1' : [255, 400, 455, 500], 'region2' : [355, 320, 555, 380], 'region3' : [1300, 260, 1500, 300], 'region4' : [1555, 300, 1900, 400], 'region5' : [50, 1250, 1350, 1300], 'region6' : [2200, 450, 2300, 650], 'region7' : [2200, 700, 2300, 1200]}, flags={'show_vid': True})
    final_iou_list = obj.process_video()

    with open(video_path[:-4] + "_final_iou_list.json", "w") as outfile:
        json.dump(final_iou_list, outfile)