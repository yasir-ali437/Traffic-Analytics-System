import requests
import time
from MultiProcessor.multi_process_changed import MultiProcess
import threading
import json
import os

class MasterNode():
    def __init__(self):      
        self.base_url = "http://192.168.10.87:5005/"
        self.url = self.base_url + "job"
        self.url_data_post = self.base_url + "metadata"
        self.url_status_post = self.base_url + "video/"        
        self.video_folder = "/media/adlytic/00E661CFE661C58E/OMNO AI Projects/Trafflytic/videos"
        self.headers = {
        'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJwdWJsaWNfaWQiOjEsImV4cCI6MTcwMzgzMjY5MX0.zaMtg0YGgJsWIJymp9vgYfjnrDBX-J_aGl615aBdMlY',
        'Content-Type': 'application/json'
        }
        self.RUN = True
        self.stop_server = False
        self.jobs= {}
        self.id_videos = {}
        self.video_info_list = []
        self.vid_job_map = {}
        params = {'flags' : {'thresh' : 1}}
        self.multi_processing_handler = MultiProcess(params)
        self.video_status = {}
        
    def check_for_updates(self):
        job_list = requests.request("GET", self.url, headers = self.headers).json()["data"]
        for job in job_list:
            job_id = job['id']
            if True:
                if job['jobStart'] == 0 and job_id in self.jobs:
                    for vid in self.jobs[job_id]["videos"]:
                        self.multi_processing_handler.update_vid_processing_flags(vid['path'], False) 
                                               
                if job_id in self.jobs and job['jobStart'] != 0: # check if we need to update current job
                    for vid in job["videos"]: #assuming all video paths are unique                                                
                        path = os.path.join(self.video_folder, vid['path'])
                        if vid['status'] != 2:
                            for stored_vid in self.jobs[job_id]['videos']:
                                stored_path = stored_vid['path']
                                if path == stored_path:
                                    if stored_vid['visualize'] != vid['visualize']:
                                        stored_vid['visualize'] = vid['visualize']
                                        self.multi_processing_handler.update_show_vid_flags( path, vid['visualize'])
                elif job['jobStart'] == 1: # we need to add new job
                    self.jobs[job_id] = {}
                    for video in job["videos"]:
                        
                        video["path"] = os.path.join(self.video_folder, video['path'])
                        #video["path"] = os.path.join(self.video_folder, video['path'])
                        
                        if "videos" not in self.jobs[job_id]:
                            self.jobs[job_id]["videos"] = [video]
                        else:
                            self.jobs[job_id]["videos"].append(video)

                    for region in job["regions"]:
                        if "regions" not in self.jobs[job_id]:
                            self.jobs[job_id]["regions"] = {}
                        self.jobs[job_id]["regions"][region["id"]] = {}
                        region_crrs = json.loads(region["coordinate"].replace("'", "\""))                      
                        curr = [( int(cr['x']), int(cr['y'])) for cr in region_crrs ]                    
                        self.jobs[job_id]["regions"][region["id"]][region["title"]] = curr                    
                    self.jobs[job_id]["directions"] = job["directions"]
                    meta_data = {}
                    meta_data['meta_data_region'] = {m:n for k, v in self.jobs[job_id]["regions"].items() for m, n in v.items() }
                    for vid in self.jobs[job_id]["videos"]:
                        meta_data["meta_data_time"] = {'start_time' : vid["start_time"], 'end_time' : vid["end_time"]}
                        meta_data['flags'] = {'visualize': vid['visualize']} #vid['visualize']}
                        meta_data['job_id'] = job_id
                        self.multi_processing_handler.add_new_request([vid['path'], meta_data])
                        self.vid_job_map[vid['path']] = job_id
                        
    def check_completed_jobs(self):
        done_queue = self.multi_processing_handler.done_queue.copy()
        # job list reverse mapping
        done_paths = done_queue.keys()
        for vid_path in done_paths:
            job_id = self.vid_job_map[vid_path]
            for vid in self.jobs[job_id]["videos"]:
                    if vid["path"] == vid_path:
                        v_id = vid["id"]
                        data = done_queue[vid["path"]]
                        to_post = self.compile_data(data, v_id, job_id)
                        print(to_post)
                        resp = requests.request("POST", self.url_data_post, headers = self.headers, json=to_post)
                        print("#"*30)
                        print(resp.content)
                        self.multi_processing_handler.remove_completed_vid(vid_path)
                        url = self.url_status_post+str(v_id)
                        to_post = {"status": 2}
                        resp = requests.request("PUT", url, headers = self.headers, json=to_post)
                        print("status post response:", resp.content)
                        vid['status'] = 2

    def post_vid_status(self):
        req_que = self.multi_processing_handler.request_queue
        curr_que = self.multi_processing_handler.current_queue.keys()        
        #TODO: should we update request queue status?
        for reqs in req_que:
            vid_path = reqs[0]
            job_id = self.vid_job_map[vid_path]
            for vid in self.jobs[job_id]["videos"]:
                if vid["path"] == vid_path:
                    v_id = vid["id"]
                    url = self.url_status_post+str(v_id)
                    to_post = {"status": 0}
                    resp = requests.request("PUT", url, headers = self.headers, json=to_post)
                    print("status post response:", resp.content)
        
        for curr_vids in curr_que:
            vid_path = curr_vids
            job_id = self.vid_job_map[vid_path]
            for vid in self.jobs[job_id]["videos"]:
                if vid["path"] == vid_path:
                    v_id = vid["id"]
                    url = self.url_status_post+str(v_id)
                    to_post = {"status": 1}
                    resp = requests.request("PUT", url, headers = self.headers, json=to_post)
                    print("status post response:", resp.content)
                    
    def compile_data(self, data, v_id, job_id):
        to_post = []
        region_reverse = {a:k for k, v in self.jobs[job_id]["regions"].items() for a in v}
        for detection in data:
            direction_id = self.determine_direction(job_id, detection, region_reverse)
            if direction_id:
                single_detection = {'job_id': job_id, 'video_id': v_id, "direction_id": direction_id , "vehicle_id": detection['cls'], 'video_time': detection['end_time'] }
                to_post.append(single_detection)            
        return to_post

    def determine_direction(self, job_id, detection, region_reverse):

        start_id = region_reverse[detection['start_region']]
        end_id = region_reverse[detection['end_region']] 
        for dir in self.jobs[job_id]['directions']:
            if dir['end'] == end_id and dir['start'] == start_id:
                return dir['id']
        return None
        
    def start_server(self):
        t1 = threading.Thread(target=self.multi_processing_handler.start_processing)
        t1.start()

        while self.RUN:
            # get new server
            self.check_for_updates()
            # get request if stop process
            self.check_completed_jobs()
            self.post_vid_status()
            
            
            # ask server if stop server           
            if self.stop_server: #stop server
                self.RUN = False
                self.multi_processing_handler.SERVER_FLAG = False            
            time.sleep(5)        
        t1.join()

if __name__ == "__main__":
    comms = MasterNode()
    comms.start_server()    
    
