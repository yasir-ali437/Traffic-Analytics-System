import cv2
import json

video_path = '1.mp4'

# Opening JSON file
f = open(video_path[:-4] + "final_iou_list.json")
# returns JSON object as 
# a dictionary
data = json.load(f)

for i in data:
    start_time  =
    print(i)






# cap = cv2.VideoCapture(video_path)
# fps = cap.get(cv2.CAP_PROP_FPS)
# start_frame = int(start_time*fps)
# end_frame = int(end_time*fps)
# cap.set(cv2.CAP_PROP_POS_FRAMES, start_frame - 1)

# while True:
    
#     res, frame = cap.read()
#     print('Frame Number: ', cap.get(cv2.CAP_PROP_POS_FRAMES))
#     current_frame  = cap.get(cv2.CAP_PROP_POS_FRAMES)
#     current_time = current_frame/fps
#     if current_frame > end_frame:
#         print('End of Desired Video')
#         break
#     # cv2.imshow('img', frame)
#     # cv2.waitKey(0)
#     if res == True:
#         cv2.imshow('img', frame)
#     else:
#         break