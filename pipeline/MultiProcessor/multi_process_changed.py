
import torch.multiprocessing as multiprocessing
import sys
from multiprocessing import Lock
sys.path.append('MultiProcessor/VideoAnalyzer')  # add yolov7 ROOT to PATH
from MultiProcessor.VideoAnalyzer.track_video import TrackVideo
from multiprocessing.managers import BaseManager

class TrackerManager(BaseManager):
    pass

class DataClass():	
	def __init__(self) -> None:
		self.data = []

class MultiProcess():
	def __init__(self, params) -> None:
		self.params = params

		self.request_queue = []
		self.current_queue = {}
		self.done_queue = {}
		self.shared_lock = Lock()
		self.process_obj_list = []
		self.thresh = params['flags']['thresh']
		self.current_processes = 0
		self.skip = False
		self.vid_objects_list = []
		self.show_vid = False
		self.SERVER_FLAG = True

	def add_new_request(self, vid_info):
		self.request_queue.append(vid_info)
	
	def update_show_vid_flags(self, path, new_flag):
		with self.shared_lock:
			temp = list(self.queue._getvalue())
			self.queue.clear()
			for current_vid_data in temp: #format [filename, show_vid, analyzed_data, process_vid]
				if current_vid_data[0] == path:
					current_vid_data = (current_vid_data[0], new_flag, current_vid_data[2], current_vid_data[3])
				self.queue.add(current_vid_data)

	def update_vid_processing_flags(self, path, new_flag):
		with self.shared_lock:
			temp = list(self.queue._getvalue())
			self.queue.clear()
			for current_vid_data in temp: #format [filename, show_vid, analyzed_data, process_vid]
				if current_vid_data[0] == path:
					current_vid_data = (current_vid_data[0], current_vid_data[1], current_vid_data[2], new_flag)
				self.queue.add(current_vid_data)

	def start_processing(self):
		TrackerManager.register('set', set)
		with TrackerManager() as manager:
			self.queue = manager.set()
			while self.SERVER_FLAG:			
				if self.current_processes < self.thresh and len(self.request_queue) > 0:						 
					data=self.request_queue.pop(0)
					vid=data[0]
					info=data[1]
					show_vid = info['flags']['visualize']
					start_time = info['meta_data_time']['start_time']
					end_time = info['meta_data_time']['end_time']
					region_dict = info['meta_data_region']							
					self.queue.add((vid, show_vid, DataClass(), True))
					p =multiprocessing.Process(target=self.create_and_start_process, args=(vid, start_time, end_time, region_dict, show_vid, self.queue,)) 
					self.current_queue[vid] = p
					p.start()
					self.current_processes += 1	
				del_name = None			
				for v, proc in self.current_queue.items():
					if proc.exitcode is None and not proc.is_alive():
						#not started 
						pass												
					elif p.exitcode is None and p.is_alive():							
						pass
					else:
						self.current_processes -= 1
						proc.join()
						self.done_queue[v] = self.get_data(v)  # TODO: get value of video from process queue

						del_name = v

				if del_name:
					del self.current_queue[del_name]
			

	def create_and_start_process(self, vid, start_time, end_time, region_dict, show_vid, queue):
		obj = TrackVideo(shared_lock = self.shared_lock, video_path = vid, meta_data_time = {'start_time' : start_time, 'end_time' : end_time}, meta_data_region = region_dict, flags={'show_vid': show_vid})
		obj.process_video(queue)
		
	def remove_completed_vid(self, vid_path):
		if vid_path:
			del self.done_queue[vid_path]

	def get_data(self, vid_path):
		with self.shared_lock:
			temp = list(self.queue._getvalue())
			self.queue.clear()
			data = []
			for current_vid_data in temp: #format [filename, show_vid, analyzed_data]
				if current_vid_data[0] == vid_path:
					data = current_vid_data[2].data
					continue
				self.queue.add(current_vid_data)
			return data