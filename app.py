from flask import Flask, send_from_directory, request, jsonify
from flask_sqlalchemy import SQLAlchemy
from sqlalchemy.sql import func
from sqlalchemy.sql.sqltypes import TIMESTAMP
from flask_cors import CORS
import os,datetime
from datetime import date
from passlib.hash import sha256_crypt
import jwt
from functools import wraps
from sqlalchemy import ForeignKey, Integer, String , Column, ARRAY
# from datetime import datetime
from sqlalchemy.sql import text
from sqlalchemy import func
from sqlalchemy.orm import aliased,join,relationship
from flask_cors import CORS
import sqlalchemy as sa
import cv2,time,os

basedir = os.path.abspath(os.path.dirname(__file__))

# app = Flask(__name__, static_folder=config['static'])
app = Flask(__name__, static_folder=basedir)
app.config['SECRET_KEY']='adlytic$27iu11hg34hjk1hjg24hjg14ghj'
# cors = CORS(app, resources={r"/api/*": {"origins": "*"}})
CORS(app)
app.config['SQLALCHEMY_DATABASE_URI'] =\
        'sqlite:///' + os.path.join(basedir, 'database.db')
db = SQLAlchemy(app)


class User(db.Model):
    __tablename__ = 'user'
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(120), unique=True, nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password = db.Column(db.String(500), unique=False, nullable=False)
    created_at = db.Column(db.DateTime(timezone=True), server_default=func.now())
    def __repr__(self):
        return '<User %r>' % self.email

class Job(db.Model):
    __tablename__ = 'job'
    id = Column(Integer, primary_key=True)
    title = Column(String(500), unique=False, nullable=False)
    type = Column(String(120), unique=False, nullable=False)
    is_folder = Column(Integer, unique=False, nullable=False)
    jobStart = Column(Integer, unique=False, nullable=False)
    write_video = Column(Integer, unique=False, nullable=False, server_default='0')
    status = Column(Integer, unique=False, nullable=False, server_default='0')
    survey_date = Column(String(500), unique=False, nullable=False)
    frame = db.Column(db.String(500), unique=False, nullable=False)
    location = Column(Integer, ForeignKey('location.id'),unique=False, nullable=False)
    district = Column(Integer, ForeignKey('district.id'),unique=False, nullable=False)
    city = Column(Integer, ForeignKey("city.id"),unique=False,nullable=False)
    created_at = Column(TIMESTAMP(timezone=True), server_default=func.now())
    def __repr__(self):
        return '<Job %r>' % self.title

class City(db.Model):
    __tablename__ = 'city'
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(500), unique=False, nullable=False)
    created_at = db.Column(db.DateTime(timezone=True), server_default=func.now())
    def __repr__(self):
        return '<City %r>' % self.title

class District(db.Model):
    __tablename__ = 'district'
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(500), unique=False, nullable=False)
    created_at = db.Column(db.DateTime(timezone=True), server_default=func.now())
    def __repr__(self):
        return '<District %r>' % self.title

class Location(db.Model):
    __tablename__ = 'location'
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(500), unique=False, nullable=False)
    created_at = db.Column(db.DateTime(timezone=True), server_default=func.now())
    def __repr__(self):
        return '<Location %r>' % self.title

class Video(db.Model):
    __tablename__ = 'video'
    id = db.Column(db.Integer, primary_key=True)
    job_id = Column(Integer, ForeignKey('job.id'),unique=False, nullable=False)
    title = db.Column(db.String(500), unique=False, nullable=False)
    path = db.Column(db.String(500), unique=False, nullable=False)
    status = db.Column(db.Integer, unique=False, server_default='0')
    visualize = Column(Integer, unique=False, nullable=False, server_default='0')
    start_time = db.Column(db.DateTime(timezone=True), server_default=func.now())
    end_time = db.Column(db.DateTime(timezone=True), server_default=func.now())
    created_at = db.Column(db.DateTime(timezone=True), server_default=func.now())
    def __repr__(self):
        return '<Video %r>' % self.title

class Region(db.Model):
    __tablename__ = 'region'
    id = db.Column(db.Integer, primary_key=True)
    job_id = Column(Integer, ForeignKey('job.id'),unique=False, nullable=False)
    title = db.Column(db.String(500), unique=False, nullable=False)
    coordinate = db.Column(db.String(500), unique=False, nullable=False)
    created_at = db.Column(db.DateTime(timezone=True), server_default=func.now())
    def __repr__(self):
        return '<Region %r>' % self.title

class Direction(db.Model):
    __tablename__ = 'direction'
    id = db.Column(db.Integer, primary_key=True)
    job_id = Column(Integer, ForeignKey('job.id'),unique=False, nullable=False)
    title = db.Column(db.String(500), unique=False, nullable=False)
    start = Column(Integer, ForeignKey('region.id'),unique=False, nullable=False)
    end = Column(Integer, ForeignKey('region.id'),unique=False, nullable=False)
    created_at = db.Column(db.DateTime(timezone=True), server_default=func.now())

    start_address = relationship("Region", foreign_keys=[start])
    end_address = relationship("Region", foreign_keys=[end])

    def __repr__(self):
        return '<Region %r>' % self.title

class SystemLogs(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    gpu = db.Column(db.Integer, unique=False, nullable=False)
    cpu = db.Column(db.Integer, unique=False, nullable=False)
    ram = db.Column(db.Integer, unique=False, nullable=False)
    temp = db.Column(db.Integer, unique=False, nullable=False)
    created_at = db.Column(db.DateTime(timezone=True), server_default=func.now())
    def __repr__(self):
        return '<SystemLogs %r>' % self.created_at

class ErrorLogs(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    type = db.Column(db.String(50), unique=False, nullable=False)
    details = db.Column(db.String(1000), unique=False, nullable=False)
    status = db.Column(db.Integer, unique=False, nullable=False)
    created_at = db.Column(db.DateTime(timezone=True), server_default=func.now())
    def __repr__(self):
        return '<ErrorLogs %r>' % self.created_at

class Settings(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    capacity = db.Column(db.Integer, unique=False, nullable=False, server_default='1')
    jobs = db.Column(db.String(200), unique=False, nullable=False, server_default='[]')
    videos = db.Column(db.String(200), unique=False, nullable=False, server_default='[]')
    created_at = db.Column(db.DateTime(timezone=True), server_default=func.now())
    def __repr__(self):
        return '<Settings %r>' % self.id

class Vehicle(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    label = db.Column(db.String(200), unique=True, nullable=False, server_default="1")
    created_at = db.Column(db.DateTime(timezone=True), server_default=func.now())
    def __repr__(self):
        return '<Vehicle %r>' % self.label
        
class MetaData(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    job_id = db.Column(db.Integer, unique=False, nullable=False, server_default="1")
    video_id = db.Column(db.Integer, unique=False, nullable=False, server_default="1")
    direction_id = db.Column(db.Integer, unique=False, nullable=False, server_default="1")
    vehicle_id = db.Column(db.Integer, unique=False, nullable=False, server_default="1")
    video_time = db.Column(db.DateTime(timezone=True), server_default=func.now())
    created_at = db.Column(db.DateTime(timezone=True), server_default=func.now())
    def __repr__(self):
        return '<MetaData %r>' % self.id

with app.app_context():
    db.create_all()

def token_required(f):
    @wraps(f)
    def decorator(*args, **kwargs):
        token = None
        if 'Authorization' in request.headers:
            token = request.headers['Authorization'].split(" ")[1]
        if not token:
            return jsonify({'status': False, 'message': 'a valid token is missing'})
        try:
            data = jwt.decode(token, app.config['SECRET_KEY'], algorithms=["HS256"])
            current_user = data['public_id']
            # return 
        except:
            return jsonify({'status': False , 'message': 'token is invalid'})
        # print(" *args, **kwargs",**kwargs)    
        return f( *args, **kwargs)
    return decorator

@app.route('/login', methods=["POST"])
def login():
    content = request.json
    print("Email", content["email"])
    print("Password", content["password"])
    res = {}
    try:
        user = User.query.filter_by(email=content["email"]).first()
        print("I AM IN TRY",user)
        # rows = con.execute("SELECT * FROM users WHERE email = ? AND id > ?", (content["email"], 0) ).fetchall()
        data = []
        # for row in rows:
        if(sha256_crypt.verify(content["password"], user.password)):
            print(app.config['SECRET_KEY'])
            # return "PAssowrd MAtched"
            _data = {}
            _data["id"] = user.id
            _data["email"] = user.email
            _data["full_name"] = user.name

            token = jwt.encode({'public_id': user.id, 'exp' : datetime.datetime.utcnow() + datetime.timedelta(minutes=365*24*60)}, app.config['SECRET_KEY'], algorithm="HS256")
            # token="Koi baat ni"
            print("I MA PRINTINJG TOKEN",_data)
            
            try:
                token = token.decode("utf-8")
            except:
                print("token is not decoded")
            _data["token"] = token
            data.append(_data)
        if len(data):
            res["data"] = data[0]
            res["status"] = True
            res["message"] = "User successfully logged in."
            return jsonify(res)
        else:
            res["data"] = []
            res["status"] = False
            res["message"] = "Email or password does not match."
            return jsonify(res)
    except Exception as e:
        res["data"] = []
        res["error"] = str(e)
        res["status"] = False
        res["message"] = "Server error."
        return jsonify(res)


@app.route("/user", methods=["GET", "POST"])
def user_create_get():
    if request.method == "POST":
        # password=request.json["password"],
        # email=request.json["email"],
        # password=password[0]
        # email=email[0]
        # created_at=datetime.datetime.now()
        # print("Yasir",password,email,created_at)
        try:
            user = User(
                name=request.json["name"],
                email=request.json["email"],
                password= sha256_crypt.hash(request.json["password"])
            )
            db.session.add(user)
            db.session.commit()
            res={}
            res['status'] = True
            res['message']="User Added Successfully"
            res['email']=request.json["email"]
            res['name']=request.json["name"]
            res['password']=request.json["password"]
            # res['error']=e
            return res
        except Exception as e:
            res={}
            res['error']=str(e)
            res['status'] = False
            res['message']="User Not Added"
            # res['error']=e
            return res
    elif request.method == "GET":
        try:
            user = User.query.all()
            print("DSVCSV",user)
            all_users=[]
            for use in user:
                userr={}
                userr['id']=use.id
                userr['name']=use.name
                userr['email']=use.email
                all_users.append(userr)

            res={}
            res['status']=True
            res['data']=all_users
            return res
        except Exception as e:
            res={}
            res['status']=False
            res['error']=str(e)
            res['message']="No users found"
            # res['error']=e
            return res

@app.route("/user/<int:id>", methods=["GET","PUT","DELETE"])
@token_required
def user_detail(id):

    if request.method == "GET":
        try:
            user = db.get_or_404(User, id)
            res={}
            res['status']=True
            res['name']=user.name
            res['email']=user.email
            return res
        except Exception as e:
            res={}
            res['status']=False
            res['error']=str(e)
            res['message']="User Not Found"
            return res
    elif request.method == "PUT":
        try:
            print(" Before I AM A AUSER",request.json)

            content=request.json
            value = User.query.filter(User.id == id).first()

            for keys, values in content.items(): 
                print(keys ,values)
                # value[keys]=values
                if(keys=="name"):
                    value.name = values
                elif(keys=="email"):
                    value.email = values

            #

            db.session.flush()
            db.session.commit()

            print("After I AM A AUSER",value)
            res={}
            res['status']=True
            res['message']="User Updated Successfully"
            return res
        except Exception as e:
            res={}
            res['error']=str(e)
            res['status']=False
            res['message']="User Not Updated"
            return res 
    elif request.method == "DELETE":
        try:
            user = db.get_or_404(User, id)
            db.session.delete(user)
            db.session.commit()
            res={}
            res['status']=True
            res['message']="User Deleted Successfully"
            return res
        except:
            res={}
            res['status']=False
            res['message']="User Not Deleted"
            return res   
    
@app.route("/city", methods=["GET", "POST"])
@token_required
def city_create_get():
    if request.method == "POST":
        try:
            city = City(
                title=request.json["title"],
            )
            db.session.add(city)
            db.session.commit()
            res={}
            res['status'] = True
            res['message']="City Added Successfully"
            res['title']=request.json["title"]
            # res['error']=e
            return res
        except Exception as e:
            res={}
            res['status'] = False
            res['error']=str(e)
            res['message']="City Not Added"
            # res['error']=e
            return res
    elif request.method == "GET":
        try:
            city = City.query.all()
            # print("DSVCSV",ci)
            all_cities=[]
            for use in city:
                cityy={}
                cityy['id']=use.id
                cityy['title']=use.title
                all_cities.append(cityy)

            res={}
            res['status']=True
            res['data']=all_cities
            return res
        except Exception as e:
            res={}
            res['error']=str(e)
            res['message']="No users found"
            # res['error']=e
            return res

@app.route("/city/<int:id>", methods=["GET","PUT","DELETE"])
@token_required
def city_detail(id):
    # print("FDSAFVCDSAF",id)
    if request.method == "GET":
        try:
            city = db.get_or_404(City, id)
            res={}
            res['status']=True
            res['title']=city.title
            return res
        except Exception as e:
            res={}
            res['error']=str(e)
            res['status']=False
            res['message']="City Not Found"
            return res
    elif request.method == "PUT":
        try:
            content=request.json
            value = City.query.filter(City.id == id).first()
            for keys, values in content.items():
                if(keys=="title"):
                    value.title = values
            db.session.flush()
            db.session.commit()
            res={}
            res['status']=True
            res['message']="City Updated Successfully"
            return res
        except Exception as e:
            res={}
            res['error']=str(e)
            res['status']=False
            res['message']="City Not Updated"
            return res 
    elif request.method == "DELETE":
        try:
            city = db.get_or_404(City, id)
            db.session.delete(city)
            db.session.commit()
            res={}
            res['status']=True
            res['message']="City Deleted Successfully"
            return res
        except Exception as e:
            res={}
            res['error']=str(e)
            res['status']=False
            res['message']="City Not Deleted"
            return res   
    
@app.route("/district", methods=["GET", "POST"])
@token_required
def district_create_get():
    if request.method == "POST":
        try:
            district = District(
                title=request.json["title"],
            )
            db.session.add(district)
            db.session.commit()
            res={}
            res['message']="District Added Successfully"
            res['title']=request.json["title"]
            res['status'] = True

            # res['error']=e
            return res
        except Exception as e:
            res={}
            res['error']=str(e)
            res['status'] = False
            res['message']="District Not Added"
            # res['error']=e
            return res
    elif request.method == "GET":
        try:
            district = District.query.all()
            # print("DSVCSV",ci)
            all_districts=[]
            for use in district:
                districtt={}
                districtt['id']=use.id
                districtt['title']=use.title
                all_districts.append(districtt)
            res={}
            res['status']=True
            res['data']=all_districts
            return res
        except Exception as e:
            res={}
            res['error']=str(e)
            res['status']=False
            res['message']="No users found"
            # res['error']=e
            return res

@app.route("/district/<int:id>", methods=["GET","PUT","DELETE"])
@token_required
def district_detail(id):

    if request.method == "GET":
        try:
            district = db.get_or_404(District, id)
            res={}
            res['status']=True
            res['title']=district.title
            return res
        except Exception as e:
            res={}
            res['error']=str(e)
            res['status']=False
            res['message']="District Not Found"
            return res
    elif request.method == "PUT":
        try:
            content=request.json
            value = District.query.filter(District.id == id).first()
            for keys, values in content.items():
                if(keys=="title"):
                    value.title = values
            db.session.flush()
            db.session.commit()
            res={}
            res['status']=True
            res['message']="District Updated Successfully"
            return res
        except Exception as e:
            res={}
            res['error']=str(e)
            res['status']=False
            res['message']="District Not Updated"
            return res 
    elif request.method == "DELETE":
        try:
            district = db.get_or_404(District, id)
            db.session.delete(district)
            db.session.commit()
            res={}
            res['status']=True
            res['message']="District Deleted Successfully"
            return res
        except:
            res={}
            res['status']=False
            res['message']="District Not Deleted"
            return res   
   
@app.route("/location", methods=["GET", "POST"])
@token_required
def location_create_get():
    if request.method == "POST":
        try:
            location = Location(
                title=request.json["title"],
            )
            db.session.add(location)
            db.session.commit()
            res={}
            res['status'] = True
            res['message']="Location Added Successfully"
            res['title']=request.json["title"]
            # res['error']=e
            return res
        except Exception as e:
            res={}
            res['error']=str(e)
            res['status'] = False
            res['message']="Location Not Added"
            # res['error']=e
            return res
    elif request.method == "GET":
        try:
            location = Location.query.all()
            # print("DSVCSV",ci)
            all_locations=[]
            for use in location:
                locations={}
                locations['id']=use.id
                locations['title']=use.title
                all_locations.append(locations)
            res={}
            res['status']=True
            res['data']=all_locations
            return res
        except Exception as e:
            res={}
            res['error']=str(e)
            res['status']=False
            res['message']="No users found"
            # res['error']=e
            return res

@app.route("/location/<int:id>", methods=["GET","PUT","DELETE"])
@token_required
def location_detail(id):

    if request.method == "GET":
        try:
            location = db.get_or_404(Location, id)
            res={}
            res['status']=True
            res['title']=location.title
            return res
        except Exception as e:
            res={}
            res['error']=str(e)
            res['status']=False
            res['message']="Location Not Found"
            return res
    elif request.method == "PUT":
        try:
            content=request.json
            value = Location.query.filter(Location.id == id).first()
            for keys, values in content.items():
                if(keys=="title"):
                    value.title = values
            db.session.flush()
            db.session.commit()
            res={}
            res['status']=True
            res['message']="Location Updated Successfully"
            return res
        except Exception as e:
            res={}
            res['error']=str(e)
            res['status']=False
            res['message']="Location Not Updated"
            return res 
    elif request.method == "DELETE":
        try:
            location = db.get_or_404(Location, id)
            db.session.delete(location)
            db.session.commit()
            res={}
            res['status']=True
            res['message']="Location Deleted Successfully"
            return res
        except Exception as e:
            res={}
            res['error']=str(e)
            res['status']=False
            res['message']="Location Not Deleted"
            return res   
   
@app.route("/job", methods=["GET", "POST"])
@token_required
def job_create_get():
    print("I am no there")
    if request.method == "POST":
        try:
            job = Job(
                title = request.json["title"],
                type = request.json["type"],
                is_folder = request.json["is_folder"],
                write_video = request.json["write_video"],
                jobStart = request.json["jobStart"],
                status = request.json["status"],
                frame = request.json["frame"],
                survey_date = request.json["survey_date"],
                city=request.json["city"],
                location=request.json["location"],
                district=request.json["district"]
            )
            db.session.add(job)
            db.session.commit()
            db.session.refresh(job)
            res={}
            res['id']=job.id
            res['status'] = True
            res['message']="Job Added Successfully"
            res['title']=request.json["title"]
            # res['error']=e
            return res
        except Exception as e:
            res={}
            res['error']=str(e)
            res['status'] = False
            res['message']="Job Not Added"
            # res['error']=e
            return res
    elif request.method == "GET":
        try:
            results=db.session.query(Job,Location,City,District).join(Location).join(City).join(District).all()
            all_jobs=[]
            for job,location,city,district in results:
                all_videos=[]
                all_regions=[]
                all_directions=[]
                videos = db.session.query(Video).filter(Video.job_id == job.id).all()
                videos1 = db.session.query(Video).filter((Video.job_id == job.id),(Video.status == 2)).all()

                regions = db.session.query(Region).filter(Region.job_id == job.id).all()
                directions = db.session.query(Direction).filter(Direction.job_id == job.id).all()
                for video in videos:
                    vide={}
                    vide['id']=video.id
                    vide['title']=video.title
                    vide['path']=video.path
                    vide['status']=video.status
                    vide['visualize']=video.visualize
                    vide['start_time']=video.start_time
                    vide['end_time']=video.end_time
                    all_videos.append(vide)
                for region in regions:
                    regio={}
                    regio['id']=region.id
                    regio['title']=region.title
                    regio['coordinate']=region.coordinate
                    all_regions.append(regio)
                for direction in directions:
                    directio={}
                    directio['id']=direction.id
                    directio['title']=direction.title
                    directio['start']=direction.start
                    directio['end']=direction.end
                    all_directions.append(directio)
                
                jobs={}
                jobs['id']=job.id
                jobs['title']=job.title
                jobs['type']=job.type
                jobs['is_folder']=job.is_folder
                jobs['write_video']=job.write_video
                jobs['jobStart']=job.jobStart
                jobs['status']=job.status
                jobs['frame']=job.frame
                jobs['survey_date']=job.survey_date
                jobs['city']=city.title
                jobs['location']=location.title
                jobs['district']=district.title

                jobs['videos']=all_videos
                jobs['regions']=all_regions
                jobs['directions']=all_directions
                if(len(videos1)>0 and len(videos)>0):
                    print("IN IF")
                    jobs['progress']=int((len(videos1)/len(videos))*100)
                else:
                    jobs['progress']=0
                all_jobs.append(jobs)
            
            res={}
            res['status']=True
            res['data']= all_jobs
            return res
            # job = Job.query.all()
            # # print("DSVCSV",ci)
            # all_jobs=[]
            # for use in job:
            #     jobs={}
            #     jobs['id']=use.id
            #     jobs['title']=use.title
            #     jobs['type']=use.type
            #     jobs['is_folder']=use.is_folder
            #     jobs['survey_date']=use.survey_date
            #     jobs['city']=use.city
            #     jobs['location']=use.location
            #     jobs['district']=use.district
            #     all_jobs.append(jobs)
            # return all_jobs
        except Exception as e:
            res={}
            res['error']=str(e)
            res['status']=False
            res['message']="No jobs found"
            # res['error']=e
            return res

@app.route("/job/<int:id>", methods=["GET","PUT","DELETE"])
@token_required
def job_detail(id):

    if request.method == "GET":
        try:
            results = db.session.query(Job,Location,City,District).join(Location).join(City).join(District).filter(Job.id == id).all()
            videos = db.session.query(Video).filter(Video.job_id == id).all()
            videos1 = db.session.query(Video).filter((Video.job_id == id),(Video.status == 2)).all()
            regions = db.session.query(Region).filter(Region.job_id == id).all()
            directions = db.session.query(Direction).filter(Direction.job_id == id).all()

            # print("TYPEEEEEEEEEEEEEEEEEEEEEEEEe",results)
            all_jobs=[]
            all_videos=[]
            all_regions=[]
            all_directions=[]
            for job,location,city,district in results:
                # print("I AM RES",job,location,city,district)
                jobs={}
                jobs['id']=job.id
                jobs['title']=job.title
                jobs['type']=job.type
                jobs['is_folder']=job.is_folder
                jobs['write_video']=job.write_video
                jobs['jobStart']=job.jobStart
                jobs['status']=job.status
                jobs['frame']=job.frame
                jobs['survey_date']=job.survey_date
                jobs['city']=city.title
                jobs['location']=location.title
                jobs['district']=district.title
                all_jobs.append(jobs)
            for video in videos:
                vide={}
                vide['id']=video.id
                vide['title']=video.title
                vide['path']=video.path
                vide['status']=video.status
                vide['visualize']=video.visualize
                vide['start_time']=video.start_time
                vide['end_time']=video.end_time
                all_videos.append(vide)
            for region in regions:
                regio={}
                regio['id']=region.id
                regio['title']=region.title
                regio['coordinate']=region.coordinate
                all_regions.append(regio)
            for direction in directions:
                directio={}
                directio['id']=direction.id
                directio['title']=direction.title
                directio['start']=direction.start
                directio['end']=direction.end
                all_directions.append(directio)

            all_jobs[0]['videos']=all_videos
            all_jobs[0]['regions']=all_regions
            all_jobs[0]['directions']=all_directions
            if(len(videos1)>0 and len(videos)>0):
                print("IN IF")
                all_jobs[0]['progress']=int((len(videos1)/len(videos))*100)
            else:
                all_jobs[0]['progress']=0
            res={}
            res['status']=True
            res['data']=all_jobs[0]
            return res
            # res={}
            # res['id']=job.id
            # res['title']=job.title
            # res['type']=job.type
            # res['is_folder']=job.is_folder
            # res['survey_date']=job.survey_date
            # res['city']=job.city
            # res['location']=job.location
            # res['district']=job.district
            # return res
        except Exception as e:
            res={}
            res['error']=str(e)
            res['status']=False
            res['message']="Job Not Found"
            return res
    elif request.method == "PUT":
        try:
            content=request.json
            value = Job.query.filter(Job.id == id).first()
            for keys, values in content.items():
                if(keys=="title"):
                    value.title = values
                if(keys=="type"):
                    value.type = values
                if(keys=="is_folder"):
                    value.is_folder = values
                if(keys=="write_video"):
                    value.write_video = values
                if(keys=="status"):
                    value.status = values
                if(keys=="frame"):
                    value.frame = values
                if(keys=="survey_date"):
                    value.survey_date = values
                if(keys=="city"):
                    value.city = values
                if(keys=="location"):
                    value.location = values
                if(keys=="district"):
                    value.district = values
                if(keys=="jobStart"):
                    value.jobStart = values
            db.session.flush()
            db.session.commit()
            
            res={}
            res['status']=True
            res['message']="Job Updated Successfully"
            return res
        except Exception as e:
            res={}
            res['error']=str(e)
            res['status']=False
            res['message']="Job Not Updated"
            return res 
    elif request.method == "DELETE":
        try:
            job = db.get_or_404(Job, id)
            db.session.delete(job)
            db.session.commit()
            video = db.session.query(Video).filter(Video.job_id==id).all()
            for vid in video:
                db.session.delete(vid)
                db.session.commit()
            region = db.session.query(Region).filter(Region.job_id==id).all()
            for reg in region:
                db.session.delete(reg)
                db.session.commit()
            direction = db.session.query(Direction).filter(Direction.job_id==id).all()
            for dir in direction:
                db.session.delete(dir)
                db.session.commit()
            metadata = db.session.query(MetaData).filter(MetaData.job_id==id).all()
            for meta in metadata:
                db.session.delete(meta)
                db.session.commit()

            res={}
            res['status']=True
            res['Job']="Job Deleted Successfully"
            res['Video']=(str(len(video)))+" Video Deleted Successfully"
            res['Region']=(str(len(region)))+" Region Deleted Successfully"
            res['MetaData']=(str(len(metadata)))+" MetaData Deleted Successfully"
            res['Direction']=(str(len(direction)))+" Direction Deleted Successfully"
            return res
        except Exception as e:
            res={}
            res['error']=str(e)
            res['status']=False
            res['message']="Job Not Deleted"
            return res    

@app.route("/job/start", methods=["GET", "POST"])
@token_required
def job_start():
    try:
        print("START")
        os.system('python ../pipeline/master.py')

        res={}
        res['status']=True
        res['message']="Pipeline Started !!!"
    except Exception as e:
        res={}
        res['error']=str(e)
        res['status']=False
        res['message']="Pipeline Not Started !!!"
        return res   

@app.route("/video", methods=["GET", "POST"])
@token_required
def video_create_get():
    global DRIVE_PATH
    DRIVE_PATH = "../videos"
    # if not os.path.isdir(DRIVE_PATH):
    #     os.makedirs(DRIVE_PATH)

    # print("PATH",request.json['videos'][0]['path'])
    
    if request.method == "POST":
        global image_frame
        try:
            # job = db.session.query(Job).filter(Job.id == request.json["job_id"]).all()
            # for jobb in job:
            # if(jobb.is_folder==0):
            print("Not folder")
            path=request.json['videos'][0]['path']
            print("I AM VIDEO PATH",request.json['videos'][0]['path'])
            print("I MA IMAGE",DRIVE_PATH+'/'+path)
            stream = cv2.VideoCapture(DRIVE_PATH+'/'+path)
            ret, frame = stream.read()
            print("RETE", ret,frame)
            if ret:
                # frame = cv2.resize(frame, (512,512))
                ts = time.time()
                print(ts)
                directory = "./uploads/"
                os.makedirs(directory, exist_ok=True)
                image_frame="/uploads/"+str(ts)+"_frame.png"
                cv2.imwrite(directory+str(ts)+"_frame.png", frame)
                print("IMAFDVFSD",image_frame)
                # image_frame=""
            else:
                image_frame=""
            output=[]
            value = Job.query.filter(Job.id == request.json["job_id"]).first()
            print("VALUE",value.survey_date)
            for videoo in request.json['videos']:
                print("ITS CIEOD",videoo)
                video = Video(
                    title = videoo["title"],
                    path = videoo["path"],
                    visualize = videoo["visualize"],
                    job_id = request.json["job_id"],
                    start_time = datetime.datetime.strptime(value.survey_date+" "+videoo["start_time"], "%Y-%m-%d %H:%M:%S"),
                    end_time=datetime.datetime.strptime(value.survey_date+" "+videoo["end_time"], "%Y-%m-%d %H:%M:%S"),
                )
                db.session.add(video)
                db.session.commit()
                output.append(videoo["title"])
            value = Job.query.filter(Job.id == request.json["job_id"]).first()
            value.frame=image_frame
            db.session.flush()
            db.session.commit()
            res={}
            res['message']="Video Added Successfully "

            res['status'] = True
            res['video']=output
            res['frame']=image_frame
            return res
            # res['error']=e
        except Exception as e:
            res={}
            res['error']=str(e)
            res['status'] = False
            res['message']="Video Not Added"
            return res

            # res['error']=e
    elif request.method == "GET":
        try:
            # video = Video.query.all()
            # # print("DSVCSV",ci)
            # all_videos=[]
            # for use in video:
            #     videos={}
            #     videos['id']=use.id
            #     videos['title']=use.title
            #     videos['path']=use.path
            #     videos['job_id']=use.job_id
            #     videos['start_time']=use.start_time
            #     videos['end_time']=use.end_time
            #     all_videos.append(videos)
            # return all_videos
            results=db.session.query(Video,Job).join(Job).all()
            print("TYPE",results)
            all_videos=[]
            for video,job in results:
                print("I AM RES",video,job)
                # for use in region:
                videos={}
                videos['id']=video.id
                videos['title']=video.title
                videos['path']=video.path
                videos['visualize']=video.visualize
                videos['status']=video.status
                videos['job_id']=job.id
                videos['job_title']=job.title
                videos['start_time']=video.start_time
                videos['end_time']=video.end_time
                all_videos.append(videos)

            res={}
            res['status']=True
            res['data']=all_videos
            return res
        except Exception as e:
            res={}
            res['error']=str(e)
            res['status']=False
            res['message']="No videos found"
            # res['error']=e
            return res

@app.route("/video/<int:id>", methods=["GET","PUT","DELETE"])
@token_required
def video_detail(id):

    if request.method == "GET":
        try:
            # video = db.get_or_404(Video, id)
            # res={}
            # res['id']=video.id
            # res['title']=video.title
            # res['path']=video.path
            # res['job_id']=video.job_id
            # res['start_time']=video.start_time
            # res['end_time']=video.end_time
            # return res
            results=db.session.query(Video,Job).join(Job).filter(Video.id==id).all()
            print("TYPE",results)
            all_videos=[]
            for video,job in results:
                print("I AM RES",video,job)
                # for use in region:
                videos={}
                videos['id']=video.id
                videos['title']=video.title
                videos['path']=video.path
                videos['visualize']=video.visualize
                videos['status']=video.status
                videos['job_id']=job.id
                videos['job_title']=job.title
                videos['start_time']=video.start_time
                videos['end_time']=video.end_time
                all_videos.append(videos)
            res={}
            res['status']=True
            res['data']=all_videos[0]
            return res
        except Exception as e:
            res={}
            res['error']=str(e)
            res['status']=False
            res['message']="Video Not Found"
            return res
    elif request.method == "PUT":
        try:
            content=request.json
            value = Video.query.filter(Video.id == id).first()
            for keys, values in content.items():
                if(keys=="title"):
                    value.title = values
                if(keys=="path"):
                    value.path = values
                if(keys=="visualize"):
                    value.visualize = values
                if(keys=="status"):
                    value.status = values
                if(keys=="job_id"):
                    value.job_id = values
                if(keys=="start_time"):
                    value.start_date = datetime.datetime.strptime(values, "%Y-%m-%d %H:%M:%S")
                if(keys=="end_time"):
                    value.end_date = datetime.datetime.strptime(values, "%Y-%m-%d %H:%M:%S")
            db.session.flush()
            db.session.commit()
            db.session.refresh(value)
            print("I MA AVIDEO",value.id)
            res={}
            res['status']=True
            res['id']=value.id
            res['title']=value.title
            res['path']=value.path
            res['visualize']=value.visualize
            res['job_id']=value.job_id
            res['message']="Video Updated Successfully"
            return res
        except Exception as e:
            res={}
            res['error']=str(e)
            res['status']=False
            res['message']="Video Not Updated"
            return res 
    elif request.method == "DELETE":
        try:
            video = db.get_or_404(Video, id)
            db.session.delete(video)
            db.session.commit()
            res={}
            res['message']="Video Deleted Successfully"
            return res
        except Exception as e:
            res={}
            res['error']=str(e)
            res['message']="Video Not Deleted"
            return res   
 

@app.route("/region", methods=["GET", "POST"])
@token_required
def region_create_get():
    if request.method == "POST":
        try:
            output=[]
            for regio in request.json['regions']:
                region = Region(
                    title = regio["title"],
                    coordinate = str(regio["coordinate"]),
                    job_id = request.json["job_id"]
                )
                db.session.add(region)
                db.session.commit()
                output.append(regio["title"])
            res={}
            res['message']="Region Added Successfully"
            res['status'] = True
            res['regions']=output
            # res['error']=e
            return res
        except Exception as e:
            res={}
            res['error']=str(e)
            res['status'] = False
            res['message']="Region Not Added"
            # res['error']=e
            return res
    elif request.method == "GET":
        try:
            results=db.session.query(Region,Job).join(Job).all()
            print("TYPE",results)
            all_regions=[]
            for region,job in results:
                print("I AM RES",region,job)
                # for use in region:
                regions={}
                regions['id']=region.id
                regions['title']=region.title
                regions['coordinate']=region.coordinate
                regions['job_id']=job.title
                all_regions.append(regions)
            res={}
            res['status']=True
            res['data']=all_regions
            return res

            
        except Exception as e:
            res={}
            res['error']=str(e)
            res['status']=False
            res['message']="No regions found"
            # res['error']=e
            return res

@app.route("/region/<int:id>", methods=["GET","PUT","DELETE"])
@token_required
def region_detail(id):

    if request.method == "GET":
        try:
            results=db.session.query(Region,Job).join(Job).filter(Region.id==id).all()
            print("TYPE",results)
            all_regions=[]
            for region,job in results:
                print("I AM RES",region,job)
                regions={}
                regions['id']=region.id
                regions['title']=region.title
                regions['coordinate']=region.coordinate
                regions['job_id']=job.title
                all_regions.append(regions)
            res={}
            res['status']=True
            res['data']=all_regions[0]
            return res
        except Exception as e:
            res={}
            res['error']=str(e)
            res['message']="Region Not Found"
            return res
    elif request.method == "PUT":
        try:
            content=request.json
            value = Region.query.filter(Region.id == id).first()
            for keys, values in content.items():
                if(keys=="title"):
                    value.title = values
                if(keys=="coordinate"):
                    value.coordinate = str(values)
                if(keys=="job_id"):
                    value.job_id = values
            db.session.flush()
            db.session.commit()
            res={}
            res['status']=True
            res['message']="Region Updated Successfully"
            return res
        except Exception as e:
            res={}
            res['error']=str(e)
            res['status']=False
            res['message']="Region Not Updated"
            return res 
    elif request.method == "DELETE":
        try:
            region = db.get_or_404(Region, id)
            db.session.delete(region)
            db.session.commit()
            res={}
            res['status']=True
            res['message']="Region Deleted Successfully"
            return res
        except Exception as e:
            res={}
            res['error']=str(e)
            res['status']=False
            res['message']="Region Not Deleted"
            return res   
 
@app.route("/direction", methods=["GET", "POST"])
@token_required
def direction_create_get():
    if request.method == "POST":
        try:
            output=[]
            for directio in request.json['directions']:
                direction = Direction(
                    title = directio["title"],
                    start = directio["start"],
                    end = directio["end"],
                    job_id = request.json["job_id"]
                )
                db.session.add(direction)
                db.session.commit()
                output.append(directio["title"])
            res={}
            res['message']="Direction Added Successfully"
            res['status'] = True
            res['directions']=output
            # res['error']=e
            return res
        except Exception as e:
            res={}
            res['error']=str(e)
            res['status'] = False
            res['message']="Direction Not Added"
            # res['error']=e
            return res
    elif request.method == "GET":
        try:
        #     direction = Direction.query.all()
        #     # print("DSVCSV",ci)
        #     all_directions=[]
        #     for use in direction:
        #         directions={}
        #         directions['id']=use.id
        #         directions['title']=use.title
        #         directions['start']=use.start
        #         directions['end']=use.end
        #         directions['job_id']=use.job_id
        #         all_directions.append(directions)
        #     return all_directions
            print("TYPE TESTING")
            # results=db.session.query(Direction).join(Region,Direction.end==Region.id).all() #.join(Direction.end==Region.id).all()
            # results = db.session.query(Direction, Region).join(Direction, Region.id == Direction.start).all()
            # results=db.session.query(Direction,Region).from_statement(text('''SELECT * FROM Region  LEFT JOIN Direction ON Region.id = Direction.start;''' )).all()
            # results = db.session.query(Direction,Region).join((Region, Direction.start==Region.id),(Region, Direction.end==Region.id)).all()
            # join(a2.id, Direction.end)
            resultsStart = db.session.query(Direction,Region).join(Region, Direction.start==Region.id).all()
            resultsEnd = db.session.query(Direction,Region).join(Region, Direction.end==Region.id).all()
            print("TYPE",resultsStart)

            all_directions=[]
            for direction,region in resultsStart:
                # print("I AM RES",direction,region)
                directions={}
                directions['id']=direction.id
                directions['title']=direction.title
                directions['start']=region.coordinate
                directions['job_id']=direction.job_id
                all_directions.append(directions)

            all_directions1=[]
            for direction,region in resultsEnd:
                directions1={}
                # print("I AM RES",directions1,region)
                directions1['id']=direction.id
                directions1['end']=region.coordinate 
                all_directions1.append(directions1)
            print("I AM TWO ARRAYS",all_directions ,all_directions1)
            res={}
            res['status']=True
            res['data']=all_directions
            return res
        except Exception as e:
            res={}
            res['error']=str(e)
            res['status']=False
            res['message']="No directions found"
            # res['error']=e
            return res

@app.route("/direction/<int:id>", methods=["GET","PUT","DELETE"])
@token_required
def direction_detail(id):

    if request.method == "GET":
        try:
            # direction = db.get_or_404(Direction, id)
            # res={}
            # res['id']=direction.id
            # res['title']=direction.title
            # res['start']=direction.start
            # res['end']=direction.end
            # res['job_id']=direction.job_id
            # return res
            results=db.session.query(Direction,Job).join(Job).filter(Direction.id==id).all()
            print("TYPE",results)
            all_videos=[]
            for direction,job in results:
                print("I AM RES",direction,job)
                # for use in region:
                videos={}
                videos['id']=direction.id
                videos['title']=direction.title
                videos['start']=direction.start
                videos['end']=direction.end
                videos['job_id']=direction.job_id
                all_videos.append(videos)
            res={}
            res['status']=True
            res['data']=all_videos[0]
            return res
        except Exception as e:
            res={}
            res['error']=str(e)
            res['status']=False
            res['message']="Direction Not Found"
            return res
    elif request.method == "PUT":
        try:
            content=request.json
            value = Direction.query.filter(Direction.id == id).first()
            for keys, values in content.items():
                if(keys=="title"):
                    value.title = values
                if(keys=="start"):
                    value.start = values
                if(keys=="end"):
                    value.end = values
                if(keys=="job_id"):
                    value.job_id = values
            db.session.flush()
            db.session.commit()
            res={}
            res['status']=True
            res['message']="Direction Updated Successfully"
            return res
        except Exception as e:
            res={}
            res['error']=str(e)
            res['status']=False
            res['message']="Direction Not Updated"
            return res 
    elif request.method == "DELETE":
        try:
            direction = db.get_or_404(Direction, id)
            db.session.delete(direction)
            db.session.commit()
            res={}
            res['status']=True
            res['message']="Direction Deleted Successfully"
            return res
        except Exception as e:
            res={}
            res['error']=str(e)
            res['status']=False
            res['message']="Direction Not Deleted"
            return res   
 
@app.route("/system_logs", methods=["GET", "POST"])
@token_required
def system_logs_create_get():
    if request.method == "POST":
        try:
            system_logs = SystemLogs(
                gpu = request.json["gpu"],
                cpu = request.json["cpu"],
                ram = request.json["ram"],
                temp = request.json["temp"]
            )
            db.session.add(system_logs)
            db.session.commit()
            res={}
            res['status'] = True
            res['message']="SystemLogs Added Successfully"
            return res
        except Exception as e:
            res={}
            res['error']=str(e)
            res['status'] = False
            res['message']="SystemLogs Not Added"
            # res['error']=e
            return res
    elif request.method == "GET":
        try:
            results = db.session.query(SystemLogs).all()
            print("TYPE",results)

            all_system_logs=[]
            for system_log in results:
                # print("I AM RES",direction,region)
                system_logs={}
                system_logs['gpu']=system_log.gpu
                system_logs['cpu']=system_log.cpu
                system_logs['ram']=system_log.ram
                system_logs['temp']=system_log.temp
                all_system_logs.append(system_logs)
            res={}
            res['status']=True
            res['data']=all_system_logs
            return res
        except Exception as e:
            res={}
            res['error']=str(e)
            res['status']=False
            res['message']="No system_logs found"
            # res['error']=e
            return res

@app.route("/system_logs/<int:id>", methods=["GET","PUT","DELETE"])
@token_required
def system_logs_detail(id):

    if request.method == "GET":
        try:
            # direction = db.get_or_404(Direction, id)
            # res={}
            # res['id']=direction.id
            # res['title']=direction.title
            # res['start']=direction.start
            # res['end']=direction.end
            # res['job_id']=direction.job_id
            # return res
            results=db.session.query(SystemLogs).filter(SystemLogs.id==id).all()
            print("TYPE",results)
            all_system_logs=[]
            for system_log in results:
                # print("I AM RES",direction,region)
                system_logs={}
                system_logs['gpu']=system_log.gpu
                system_logs['cpu']=system_log.cpu
                system_logs['ram']=system_log.ram
                system_logs['temp']=system_log.temp
                all_system_logs.append(system_logs)
            res={}
            res['status']=True
            res['data']=all_system_logs[0]
            return res
        except Exception as e:
            res={}
            res['error']=str(e)
            res['status']=False
            res['message']="SystemLogs Not Found"
            return res
    elif request.method == "PUT":
        try:
            content=request.json
            value = SystemLogs.query.filter(SystemLogs.id == id).first()
            for keys, values in content.items():
                if(keys=="gpu"):
                    value.gpu = values
                if(keys=="cpu"):
                    value.cpu = values
                if(keys=="ram"):
                    value.ram = values
                if(keys=="temp"):
                    value.temp = values
            db.session.flush()
            db.session.commit()
            res={}
            res['status']=True
            res['message']="SystemLogs Updated Successfully"
            return res
        except Exception as e:
            res={}
            res['error']=str(e)
            res['status']=False
            res['message']="SystemLogs Not Updated"
            return res 
    elif request.method == "DELETE":
        try:
            system_logs = db.get_or_404(SystemLogs, id)
            db.session.delete(system_logs)
            db.session.commit()
            res={}
            res['status']=True
            res['message']="SystemLogs Deleted Successfully"
            return res
        except Exception as e:
            res={}
            res['error']=str(e)
            res['status']=False
            res['message']="SystemLogs Not Deleted"
            return res   
 
@app.route("/error_logs", methods=["GET", "POST"])
@token_required
def error_logs_create_get():
    if request.method == "POST":
        try:
            error_logs = ErrorLogs(
                type = request.json["type"],
                details = request.json["details"],
                status = request.json["status"]
            )
            db.session.add(error_logs)
            db.session.commit()
            res={}
            res['status'] = True
            res['message']="ErrorLogs Added Successfully"
            return res
        except Exception as e:
            res={}
            res['error']=str(e)
            res['status'] = False
            res['message']="ErrorLogs Not Added"
            # res['error']=e
            return res
    elif request.method == "GET":
        try:
            results = db.session.query(ErrorLogs).all()
            print("TYPE",results)

            all_error_logs=[]
            for error_log in results:
                # print("I AM RES",direction,region)
                error_logs={}
                error_logs['type']=error_log.type
                error_logs['details']=error_log.details
                error_logs['status']=error_log.status
                all_error_logs.append(error_logs)
            res={}
            res['status']=True
            res['data']=all_error_logs
            return res
        except Exception as e:
            res={}
            res['error']=str(e)
            res['status']=False
            res['message']="No error_logs found"
            # res['error']=e
            return res

@app.route("/error_logs/<int:id>", methods=["GET","PUT","DELETE"])
@token_required
def error_logs_detail(id):

    if request.method == "GET":
        try:
            # direction = db.get_or_404(Direction, id)
            # res={}
            # res['id']=direction.id
            # res['title']=direction.title
            # res['start']=direction.start
            # res['end']=direction.end
            # res['job_id']=direction.job_id
            # return res
            results=db.session.query(ErrorLogs).filter(ErrorLogs.id==id).all()
            print("TYPE",results)
            all_error_logs=[]
            for error_log in results:
                # print("I AM RES",direction,region)
                error_logs={}
                error_logs['type']=error_log.type
                error_logs['details']=error_log.details
                error_logs['status']=error_log.status
                all_error_logs.append(error_logs)
            res={}
            res['status']=True
            res['data']=all_error_logs[0]
            return res
        except Exception as e:
            res={}
            res['error']=str(e)
            res['status']=False
            res['message']="ErrorLogs Not Found"
            return res
    elif request.method == "PUT":
        try:
            content=request.json
            value = ErrorLogs.query.filter(ErrorLogs.id == id).first()
            for keys, values in content.items():
                if(keys=="type"):
                    value.type = values
                if(keys=="details"):
                    value.details = values
                if(keys=="status"):
                    value.status = values
            db.session.flush()
            db.session.commit()
            res={}
            res['status']=True
            res['message']="ErrorLogs Updated Successfully"
            return res
        except Exception as e:
            res={}
            res['error']=str(e)
            res['status']=False
            res['message']="ErrorLogs Not Updated"
            return res 
    elif request.method == "DELETE":
        try:
            systemerror_logs_logs = db.get_or_404(ErrorLogs, id)
            db.session.delete(error_logs)
            db.session.commit()
            res={}
            res['status']=True
            res['message']="ErrorLogs Deleted Successfully"
            return res
        except Exception as e:
            res={}
            res['error']=str(e)
            res['status']=False
            res['message']="ErrorLogs Not Deleted"
            return res   
 
@app.route("/settings", methods=["GET", "POST"])
@token_required
def settings_create_get():
    if request.method == "POST":
        try:
            settings = Settings(
                capacity = request.json["capacity"],
                jobs = request.json["jobs"],
                videos = request.json["videos"]
            )
            db.session.add(settings)
            db.session.commit()
            res={}
            res['status'] = True
            res['message']="Settings Added Successfully"
            return res
        except Exception as e:
            res={}
            res['error']=str(e)
            res['status'] = False
            res['message']="Settings Not Added"
            # res['error']=e
            return res
    elif request.method == "GET":
        try:
            results = db.session.query(Settings).all()
            print("TYPE",results)

            all_settings=[]
            for setting in results:
                # print("I AM RES",direction,region)
                settings={}
                settings['capacity']=setting.capacity
                settings['jobs']=setting.jobs
                settings['videos']=setting.videos
                all_settings.append(settings)
            res={}
            res['status']=True
            res['data']=all_settings
            return res
        except Exception as e:
            res={}
            res['error']=str(e)
            res['status']=False
            res['message']="No system_logs found"
            # res['error']=e
            return res

@app.route("/settings/<int:id>", methods=["GET","PUT","DELETE"])
@token_required
def settings_detail(id):

    if request.method == "GET":
        try:
            # direction = db.get_or_404(Direction, id)
            # res={}
            # res['id']=direction.id
            # res['title']=direction.title
            # res['start']=direction.start
            # res['end']=direction.end
            # res['job_id']=direction.job_id
            # return res
            results=db.session.query(Settings).filter(Settings.id==id).all()
            print("TYPE",results)
            all_settings=[]
            for setting in results:
                # print("I AM RES",direction,region)
                settings={}
                settings['capacity']=setting.capacity
                settings['jobs']=setting.jobs
                settings['videos']=setting.videos
                all_settings.append(settings)
            res={}
            res['status']=True
            res['data']=all_settings[0]
            return res
        except Exception as e:
            res={}
            res['error']=str(e)
            res['status']=False
            res['message']="Settings Not Found"
            return res
    elif request.method == "PUT":
        try:
            content=request.json
            value = Settings.query.filter(Settings.id == id).first()
            for keys, values in content.items():
                if(keys=="capacity"):
                    value.capacity = values
                if(keys=="jobs"):
                    value.jobs = values
                if(keys=="videos"):
                    value.videos = values
            db.session.flush()
            db.session.commit()
            res={}
            res['status']=True
            res['message']="Settings Updated Successfully"
            return res
        except Exception as e:
            res={}
            res['error']=str(e)
            res['status']=False
            res['message']="Settings Not Updated"
            return res 
    elif request.method == "DELETE":
        try:
            settings = db.get_or_404(Settings, id)
            db.session.delete(settings)
            db.session.commit()
            res={}
            res['status']=True
            res['message']="Settings Deleted Successfully"
            return res
        except Exception as e:
            res={}
            res['status']=False
            res['error']=str(e)
            res['message']="Settings Not Deleted"
            return res   
 
@app.route("/vehicle", methods=["GET", "POST"])
@token_required
def vehicle_create_get():
    if request.method == "POST":
        try:
            vehicle = Vehicle(
                label = request.json["label"]
            )
            db.session.add(vehicle)
            db.session.commit()
            res={}
            res['status'] = True
            res['message']="Vehicle Added Successfully"
            return res
        except Exception as e:
            res={}
            res['error']=str(e)
            res['status'] = False
            res['message']="Vehicle Not Added"
            # res['error']=e
            return res
    elif request.method == "GET":
        try:
            results = db.session.query(Vehicle).all()
            print("TYPE",results)

            all_vehicles=[]
            for vehicle in results:
                # print("I AM RES",direction,region)
                vehicles={}
                vehicles['id']=vehicle.id
                vehicles['label']=vehicle.label
                all_vehicles.append(vehicles)
            res={}
            res['status']=True
            res['data']=all_vehicles
            return res
        except Exception as e:
            res={}
            res['error']=str(e)
            res['status']=False
            res['message']="No system_logs found"
            # res['error']=e
            return res

@app.route("/vehicle/<int:id>", methods=["GET","PUT","DELETE"])
@token_required
def vehicle_detail(id):

    if request.method == "GET":
        try:
            # direction = db.get_or_404(Direction, id)
            # res={}
            # res['id']=direction.id
            # res['title']=direction.title
            # res['start']=direction.start
            # res['end']=direction.end
            # res['job_id']=direction.job_id
            # return res
            results=db.session.query(Vehicle).filter(Vehicle.id==id).all()
            print("TYPE",results)
            all_vehicles=[]
            for vehicle in results:
                # print("I AM RES",direction,region)
                vehicles={}
                vehicles['id']=vehicle.id
                vehicles['label']=vehicle.label
                all_vehicles.append(vehicles)

            res={}
            res['status']=True
            res['data']=all_vehicles[0]
            return res
        except Exception as e:
            res={}
            res['error']=str(e)
            res['status']=False
            res['message']="Settings Not Found"
            return res
    elif request.method == "PUT":
        try:
            content=request.json
            value = Vehicle.query.filter(Vehicle.id == id).first()
            for keys, values in content.items():
                if(keys=="label"):
                    value.label = values
            db.session.flush()
            db.session.commit()
            res={}
            res['status']=True
            res['message']="Vehicle Updated Successfully"
            return res
        except Exception as e:
            res={}
            res['error']=str(e)
            res['status']=False
            res['message']="Vehicle Not Updated"
            return res 
    elif request.method == "DELETE":
        try:
            vehicle = db.get_or_404(Vehicle, id)
            db.session.delete(vehicle)
            db.session.commit()
            res={}
            res['status']=True
            res['message']="Vehicle Deleted Successfully"
            return res
        except Exception as e:
            res={}
            res['error']=str(e)
            res['status']=False
            res['message']="Vehicle Not Deleted"
            return res   
 
@app.route("/metadata", methods=["GET", "POST"])
@token_required
def metadata_create_get():
    if request.method == "POST":
        try:
            output=[]
            for metad in request.json:
                print("PRITNIGN",metad)
                metadata = MetaData(
                    job_id = metad["job_id"],
                    video_id = metad["video_id"],
                    direction_id = metad["direction_id"],
                    vehicle_id = metad["vehicle_id"],
                    video_time = datetime.datetime.strptime(metad["video_time"], "%Y-%m-%d %H:%M:%S"),
                )
                db.session.add(metadata)
                db.session.commit()
                db.session.refresh(metadata)
                output.append(metadata.id)
            res={}
            res['status'] = True
            res['No. of records']=len(output)
            res['message']="MetaData Added Successfully"
            return res
        except Exception as e:
            res={}
            res['error']=str(e)
            res['status'] = False
            res['message']="MetaData Not Added"
            # res['error']=e
            return res
    elif request.method == "GET":
        try:
            results = db.session.query(MetaData).all()
            print("TYPE",results)

            all_metadata=[]
            for metadata in results:
                # print("I AM RES",direction,region)
                metadatas={}
                metadatas['job_id']=metadata.job_id
                metadatas['video_id']=metadata.video_id
                metadatas['direction_id']=metadata.direction_id
                metadatas['vehicle_id']=metadata.vehicle_id
                metadatas['video_time']=metadata.video_time
                all_metadata.append(metadatas)
            res={}
            res['status']=True
            res['data']=all_metadata
            return res
        except Exception as e:
            res={}
            res['error']=str(e)
            res['status']=False
            res['message']="No metadata found"
            # res['error']=e
            return res

@app.route("/metadata/<int:id>", methods=["GET","PUT","DELETE"])
@token_required
def metadata_detail(id):

    if request.method == "GET":
        try:
            results=db.session.query(MetaData).filter(MetaData.id==id).all()
            print("TYPE",results)
            all_metadata=[]
            for metadata in results:
                metadatas={}
                metadatas['job_id']=metadata.job_id
                metadatas['video_id']=metadata.video_id
                metadatas['direction_id']=metadata.direction_id
                metadatas['vehicle_id']=metadata.vehicle_id
                metadatas['video_time']=metadata.video_time
                all_metadata.append(metadatas)
            res={}
            res['status']=True
            res['data']=all_metadata[0]
            return res
        except Exception as e:
            res={}
            res['error']=str(e)
            res['status']=False
            res['message']="MetaData Not Found"
            return res
    elif request.method == "PUT":
        try:
            content=request.json
            value = MetaData.query.filter(MetaData.id == id).first()
            for keys, values in content.items():
                if(keys=="job_id"):
                    value.job_id = values
                if(keys=="video_id"):
                    value.video_id = values
                if(keys=="direction_id"):
                    value.direction_id = values
                if(keys=="vehicle_id"):
                    value.vehicle_id = values
                if(keys=="video_time"):
                    value.video_time = datetime.datetime.strptime(values, "%Y-%m-%d %H:%M:%S")
            db.session.flush()
            db.session.commit()
            res={}
            res['status']=True
            res['message']="MetaData Updated Successfully"
            return res
        except Exception as e:
            res={}
            res['error']=str(e)
            res['status']=False
            res['message']="MetaData Not Updated"
            return res 
    elif request.method == "DELETE":
        try:
            metadata = db.get_or_404(MetaData, id)
            db.session.delete(metadata)
            db.session.commit()
            res={}
            res['status']=True
            res['message']="MetaData Deleted Successfully"
            return res
        except Exception as e:
            res={}
            res['error']=str(e)
            res['status']=False
            res['message']="MetaData Not Deleted"
            return res   
 
@app.route("/metadata/getData", methods=["GET", "POST"])
@token_required
def metadata_getData():
    if request.method == "POST":
        try:
            video_time=date(2022,12,29)
            print("DATEEE",video_time,request.json['job_id'])
            global format
            format=func.strftime("%Y-%m-%d %H:%M",MetaData.video_time)
            
            timenew=[{"start":" 00:00:00"}]
            interval=request.json['interval']
            ove=request.json['date']+timenew[0]["start"]
            timenew[0]["start"]=ove
            print("POFSOFVSD",ove)
            current=datetime.datetime.strptime(ove, "%Y-%m-%d %H:%M:%S")
            endlimit=datetime.datetime.strptime(str(current), "%Y-%m-%d %H:%M:%S") + datetime.timedelta(minutes=1440)

            while(datetime.datetime.strptime(str(endlimit), "%Y-%m-%d %H:%M:%S")>current):
                current=datetime.datetime.strptime(str(current), "%Y-%m-%d %H:%M:%S") + datetime.timedelta(minutes=interval)
                timenew[len(timenew)-1]["end"]=str(current)
                timenew.append({"start":str(current)})
                print("OK",current)

            timenew.pop()
            # .filter(MetaData.video_time.between(start_time,end_time))
            # results = db.session.query(MetaData,Job,Vehicle,format, func.sum(1)).join(MetaData, Vehicle.id == MetaData.vehicle_id).filter(MetaData.job_id==request.json['job_id']).group_by(format,MetaData.vehicle_id).all()
            output=[]
            for time in timenew:
                # print("I AM TIME",start_time,end_time)
                print("TIME",time['start'],time['end'])
                # start_time=request.json['date']+time['start']
                # end_time=request.json['date']+time['end']
                start_time=time['start']
                end_time=time['end']
                results = db.session.query(MetaData,format, func.sum(1)).filter(MetaData.video_time.between(start_time,end_time)).filter(MetaData.job_id==request.json['job_id']).group_by(format,MetaData.vehicle_id).all()
                print("TYPE",results)

                all_metadata={}
                all_metadata['data']=[]
                for metadata,time,sum in results:
                    # print("I AM RES",func.strftime("%Y",MetaData.video_time))
                    metadatas={}
                    metadatas['job_id']=metadata.job_id
                    metadatas['video_id']=metadata.video_id
                    metadatas['direction_id']=metadata.direction_id
                    metadatas['vehicle_id']=metadata.vehicle_id
                    metadatas['video_time']=time
                    metadatas['total']=sum#/2
                    all_metadata['data'].append(metadatas)
                    all_metadata['start']=start_time
                    all_metadata['end']=end_time
                if(len(results)==0):
                    all_metadata['start']=start_time
                    all_metadata['end']=end_time
                output.append(all_metadata)
            res={}
            res['status']=True
            res['data']=output
            return res
        except Exception as e:
            res={}
            res['error']=str(e)
            res['status']=False
            res['message']="No metadata found"
            # res['error']=e
            return res
        
@app.route("/metadata/job/<int:id>", methods=["DELETE"])
@token_required
def metadata_delete(id):
    try:
        metadata = db.session.query(MetaData).filter(MetaData.job_id==id).all()
        for meta in metadata:
            db.session.delete(meta)
            db.session.commit()
        
        res={}
        res['status']=True
        res['message']=str(len(metadata))+" records deleted successfully"
        return res
    except Exception as e:
        res={}
        res['status']=False
        res['error']=str(e)
        res['message']="MetaData Not Deleted"
        return res  

# Serve React App
@app.route('/', defaults={'path': ''})
@app.route('/<path:path>')
def serve(path):
    if path != "" and os.path.exists(app.static_folder + '/' + path):
        return send_from_directory(app.static_folder, path)
    else:
        return send_from_directory(app.static_folder, 'index.html')

if __name__ == '__main__':
    # startup()
    app.run(use_reloader=True, port=5005, threaded=True, host='0.0.0.0')
