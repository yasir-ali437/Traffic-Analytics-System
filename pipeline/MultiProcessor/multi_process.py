# importing the multiprocessing module
import multiprocessing
import threading
from typing import List, Dict
import sys

sys.path.append('VideoAnalyzer')  # add yolov7 ROOT to PATH


# from track_video import TrackVideo
from VideoAnalyzer.track_video import TrackVideo

class MultiProcess():
	def __init__(self, params) -> None:

		self.params = params
		self.video_info_dict = {}
		self.process_obj_list = []
		self.thresh = params['thresh']
		self.current_processes = 0
		self.skip = False

	# def add_new_request(self, vid_info):
	# 	self.video_info_dict[] = 


	def add_new_request(self, vid_info):

		# import pdb; pdb.set_trace()

		self.video_info_dict[vid_info[0]] = vid_info[1]


	def start_processing(self, STOP_FLAG):

		while STOP_FLAG:
		# import pdb; pdb.set_trace()

			if self.current_processes <= self.thresh:
				for i, (vid, info) in enumerate(list((self.video_info_dict.items()))):
					print(f'On video {i} currently')
					video_path = vid
					show_vid = self.params['flags']['show_vid']
					start_time = info['meta_data_time']['start_time']
					end_time = info['meta_data_time']['end_time']
					region_dict = info['meta_data_region']

					p = multiprocessing.Process(target = self.process_single_video, args = (video_path, start_time, end_time, region_dict, show_vid)) 
					del self.video_info_dict[vid]
					# import pdb; pdb.set_trace()
					self.process_obj_list.append(p)
					p.start()
					self.current_processes = self.current_processes + 1

			
			for p in self.process_obj_list:
				if p.exitcode is None and not p.is_alive():
					print("No video is being processed")
				
				elif p.exitcode is None and p.is_alive():
					# print(f"Video is still being processed for process {p}")
					pass

				else:
					self.current_processes = self.current_processes - 1
					p.join()
					# print(f"Process {p} is finished")
					break

			# while len(self.process_obj_list)!=0:
			# 	p=self.process_obj_list.pop(0)
			# 	# if p.exitcode is None and not p.is_alive():
			# 	# 	print("No video is being processed")
				
			# 	# if p.exitcode is None and p.is_alive():
			# 	if  p.is_alive():
			# 		self.process_obj_list.append(p)

			# 		print(f"Video is still being processed for process {p}")
			# 		# pass

			# 	else:
			# 		p.join()
			# 		self.current_processes = self.current_processes - 1

			# 		# print(f"Process {p} is finished")
			# 		break

			# if len(self.process_obj_list)==0:
			# 	print("No video is being processed")


			




	def process_single_video(self, video_path, start_time, end_time, region_dict, show_vid):
		obj = TrackVideo(video_path = video_path, meta_data_time = {'start_time' : start_time, 'end_time' : end_time}, meta_data_region = region_dict, flags={'show_vid': show_vid})
		obj.process_video()



if __name__ == "__main__":

	params = {'flags' : {'show_vid': True}, 'thresh' : 2}

	vid_info_list = [['/media/adlytic/00E661CFE661C58E/OMNO AI Projects/Shahzeb Naeem/trafflytic-ai-pipeline/MultiProcessor/Videos/9-00.mp4', {'meta_data_time' : {'start_time' : 25, 'end_time' : 26}, 'meta_data_region' : {'region1' : [255, 400, 455, 500], 'region2' : [355, 320, 555, 380], 'region3' : [1300, 260, 1500, 300], 'region4' : [1555, 300, 1900, 400], 'region5' : [50, 1250, 1350, 1300], 'region6' : [2200, 450, 2300, 650], 'region7' : [2200, 700, 2300, 1200]}}], ['/media/adlytic/00E661CFE661C58E/OMNO AI Projects/Shahzeb Naeem/trafflytic-ai-pipeline/MultiProcessor/Videos/2.mp4', {'meta_data_time' : {'start_time' : 25, 'end_time' : 26}, 'meta_data_region' : {'region1' : [255, 400, 455, 500], 'region2' : [355, 320, 555, 380], 'region3' : [1300, 260, 1500, 300], 'region4' : [1555, 300, 1900, 400], 'region5' : [50, 1250, 1350, 1300], 'region6' : [2200, 450, 2300, 650], 'region7' : [2200, 700, 2300, 1200]}}]]
	# import pdb; pdb.set_trace()

	# video_info_dict[vid_info_list[0][0]] = vid_info_list[0][1]

	# video_info_dict['/media/adlytic/00E661CFE661C58E/OMNO AI Projects/Shahzeb Naeem/trafflytic-ai-pipeline/MultiProcessor/Videos/2.mp4'] = {'meta_data_time' : {'start_time' : 34, 'end_time' : 36}, 'meta_data_region' : {'region1' : [255, 400, 455, 500], 'region2' : [355, 320, 555, 380], 'region3' : [1300, 260, 1500, 300], 'region4' : [1555, 300, 1900, 400], 'region5' : [50, 1250, 1350, 1300], 'region6' : [2200, 450, 2300, 650], 'region7' : [2200, 700, 2300, 1200]}, 'flags' : {'show_vid': True}}
	
	obj = MultiProcess(params)

	print("-"*30, obj.process_obj_list)

	for vid_info in vid_info_list:

		obj.add_new_request(vid_info)

		# break

	print("#"*30, obj.video_info_dict)
	t1 = threading.Thread(target=obj.start_processing, args=(True,))

	t1.start()

	# print("$"*30, obj.video_info_dict)
	vid_info = [['/media/adlytic/00E661CFE661C58E/OMNO AI Projects/Shahzeb Naeem/trafflytic-ai-pipeline/MultiProcessor/Videos/3.mp4', {'meta_data_time' : {'start_time' : 25, 'end_time' : 26}, 'meta_data_region' : {'region1' : [255, 400, 455, 500], 'region2' : [355, 320, 555, 380], 'region3' : [1300, 260, 1500, 300], 'region4' : [1555, 300, 1900, 400], 'region5' : [50, 1250, 1350, 1300], 'region6' : [2200, 450, 2300, 650], 'region7' : [2200, 700, 2300, 1200]}}]]

	obj.add_new_request(vid_info[0])

	print("*"*30, obj.video_info_dict)
	
	# print("Third video added as well!")

	print(obj.video_info_dict)
	t1.join()
	# obj.add_new_request(vid_info)

	# print()

	# obj_multi = MultiProcess(video_details_list)
    # # obj = TrackVideo(video_path = video_path, meta_data_time = {'start_time' : 25, 'end_time' : 35}, meta_data_region= {'region1' : [255, 400, 455, 500], 'region2' : [355, 320, 555, 380], 'region3' : [1300, 260, 1500, 300], 'region4' : [1555, 300, 1900, 400], 'region5' : [50, 1250, 1350, 1300], 'region6' : [2200, 450, 2300, 650], 'region7' : [2200, 700, 2300, 1200]}, flags={'show_vid': True})
    # # final_iou_list = obj.process_video()

    # # with open(video_path[:-4] + "_final_iou_list.json", "w") as outfile:
    # #     json.dump(final_iou_list, outfile)




































# # importing the multiprocessing module
# import multiprocessing
# import threading
# from typing import List, Dict
# import sys

# sys.path.append('VideoAnalyzer')  # add yolov7 ROOT to PATH


# # from track_video import TrackVideo
# from VideoAnalyzer.track_video import TrackVideo

# class MultiProcess():
# 	def __init__(self, params) -> None:

# 		self.params = params
# 		self.video_info_list = []
# 		self.process_obj_list = []
# 		self.thresh = params['thresh']
# 		self.current_processes = 0
# 		self.skip = False

# 	# def add_new_request(self, vid_info):
# 	# 	self.video_info_dict[] = 


# 	def add_new_request(self, vid_info):

# 		# import pdb; pdb.set_trace()

# 		self.video_info_list.append(vid_info)
# 		# import pdb; pdb.set_trace()



# 	def start_processing(self, STOP_FLAG):

# 		while STOP_FLAG:
# 		# import pdb; pdb.set_trace()

# 			if self.current_processes <= self.thresh:
# 				# for i, (vid, info) in enumerate(list((self.video_info_dict.items()))):
# 				i=0
# 				while len(self.video_info_list)!=0:
# 					i+=1
# 					# vid,info=self.video_info_list.pop(0)
# 					data=self.video_info_list.pop(0)

# 					# import pdb; pdb.set_trace()


# 					vid=data[0]
# 					info=data[1]



# 					print(f'On video {i} currently')
# 					video_path = vid
# 					show_vid = self.params['flags']['show_vid']
# 					start_time = info['meta_data_time']['start_time']
# 					end_time = info['meta_data_time']['end_time']
# 					region_dict = info['meta_data_region']

# 					p = multiprocessing.Process(target = self.process_single_video, args = (video_path, start_time, end_time, region_dict, show_vid)) 
# 					import pdb; pdb.set_trace()
# 					self.process_obj_list.append(p)
# 					p.start()
# 					self.current_processes = self.current_processes + 1

			
# 			# for p in self.process_obj_list:
# 			while len(self.process_obj_list)!=0:
# 				p=self.process_obj_list.pop(0)
# 				# if p.exitcode is None and not p.is_alive():
# 				# 	print("No video is being processed")
				
# 				# if p.exitcode is None and p.is_alive():
# 				if  p.is_alive():
# 					self.process_obj_list.append(p)

# 					print(f"Video is still being processed for process {p}")
# 					# pass

# 				else:
# 					p.join()
# 					self.current_processes = self.current_processes - 1

# 					# print(f"Process {p} is finished")
# 					break

# 			if len(self.process_obj_list)==0:
# 				print("No video is being processed")






# 	def process_single_video(self, video_path, start_time, end_time, region_dict, show_vid):
		
# 		obj = TrackVideo(video_path = video_path, meta_data_time = {'start_time' : start_time, 'end_time' : end_time}, meta_data_region = region_dict, flags={'show_vid': show_vid})
# 		obj.process_video()



# if __name__ == "__main__":

# 	params = {'flags' : {'show_vid': True}, 'thresh' : 2}

# 	vid_info_list = [['/home/omno/Desktop/Ahmad/trafflytic-ai-pipeline-base-code/MultiProcessor/Videos/8-30.mp4', {'meta_data_time' : {'start_time' : 25, 'end_time' : 36}, 'meta_data_region' : {'region1' : [255, 400, 455, 500], 'region2' : [355, 320, 555, 380], 'region3' : [1300, 260, 1500, 300], 'region4' : [1555, 300, 1900, 400], 'region5' : [50, 1250, 1350, 1300], 'region6' : [2200, 450, 2300, 650], 'region7' : [2200, 700, 2300, 1200]}}], ['/home/omno/Desktop/Ahmad/trafflytic-ai-pipeline-base-code/MultiProcessor/Videos/14-15.mp4', {'meta_data_time' : {'start_time' : 25, 'end_time' : 26}, 'meta_data_region' : {'region1' : [255, 400, 455, 500], 'region2' : [355, 320, 555, 380], 'region3' : [1300, 260, 1500, 300], 'region4' : [1555, 300, 1900, 400], 'region5' : [50, 1250, 1350, 1300], 'region6' : [2200, 450, 2300, 650], 'region7' : [2200, 700, 2300, 1200]}}]]
# 	# import pdb; pdb.set_trace()

# 	# video_info_dict[vid_info_list[0][0]] = vid_info_list[0][1]

# 	# video_info_dict['/media/adlytic/00E661CFE661C58E/OMNO AI Projects/Shahzeb Naeem/trafflytic-ai-pipeline/MultiProcessor/Videos/2.mp4'] = {'meta_data_time' : {'start_time' : 34, 'end_time' : 36}, 'meta_data_region' : {'region1' : [255, 400, 455, 500], 'region2' : [355, 320, 555, 380], 'region3' : [1300, 260, 1500, 300], 'region4' : [1555, 300, 1900, 400], 'region5' : [50, 1250, 1350, 1300], 'region6' : [2200, 450, 2300, 650], 'region7' : [2200, 700, 2300, 1200]}, 'flags' : {'show_vid': True}}
	
# 	obj = MultiProcess(params)

# 	print("-"*30, obj.process_obj_list)

# 	for vid_info in vid_info_list:

# 		obj.add_new_request(vid_info)

# 		break

# 	print("#"*30, obj.video_info_list)
# 	t1 = threading.Thread(target=obj.start_processing, args=(True,))

# 	t1.start()

# 	print("$"*30, obj.video_info_list)
# 	# vid_info = [['/media/adlytic/00E661CFE661C58E/OMNO AI Projects/Shahzeb Naeem/trafflytic-ai-pipeline/MultiProcessor/Videos/3.mp4', {'meta_data_time' : {'start_time' : 25, 'end_time' : 26}, 'meta_data_region' : {'region1' : [255, 400, 455, 500], 'region2' : [355, 320, 555, 380], 'region3' : [1300, 260, 1500, 300], 'region4' : [1555, 300, 1900, 400], 'region5' : [50, 1250, 1350, 1300], 'region6' : [2200, 450, 2300, 650], 'region7' : [2200, 700, 2300, 1200]}}]]

# 	# obj.add_new_request(vid_info[0])

# 	print("*"*30, obj.video_info_list)
	
# 	# print("Third video added as well!")

# 	print(obj.video_info_list)
# 	t1.join()
# 	# obj.add_new_request(vid_info)

# 	# print()

# 	# obj_multi = MultiProcess(video_details_list)
#     # # obj = TrackVideo(video_path = video_path, meta_data_time = {'start_time' : 25, 'end_time' : 35}, meta_data_region= {'region1' : [255, 400, 455, 500], 'region2' : [355, 320, 555, 380], 'region3' : [1300, 260, 1500, 300], 'region4' : [1555, 300, 1900, 400], 'region5' : [50, 1250, 1350, 1300], 'region6' : [2200, 450, 2300, 650], 'region7' : [2200, 700, 2300, 1200]}, flags={'show_vid': True})
#     # # final_iou_list = obj.process_video()

#     # # with open(video_path[:-4] + "_final_iou_list.json", "w") as outfile:
#     # #     json.dump(final_iou_list, outfile)
