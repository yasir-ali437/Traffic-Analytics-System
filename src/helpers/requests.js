import { apiUrl } from "./auth";
import axios from "axios";
import { setAllSettings, setDetails, setSettings } from "../store/actions/settingActions";
import { encryptStorage } from "../helpers/encryptStorage";
import instance from "../axiosinstance";
const localUser = encryptStorage.getItem("user");
var user = localUser ? localUser : null;
export const getLocalUser = () => {
  var localUser = encryptStorage.getItem("user");
  return localUser ? localUser : null;
};

export const updateUser = (payload) => {
  user = payload;
};


export const updateCurrentCamSetting = async (requestData) => {
  const requestOptions = {
    method: "PUT",
    url: apiUrl + "/updateSetting",
    data: requestData.params,
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer " + user.token,
    },
  };
  var response = await axios(requestOptions);

  // requestData.dispatch(setSettings(response.data));
  return response.data;
};



export const createSetting = async (requestData) => {
  const requestOptions = {
    method: "POST",
    url: apiUrl + "/createSetting",
    data: requestData,
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer " + user.token,
    },
  };
  var response = await axios(requestOptions);
  if (response.status === 200) {
    // getAllSettings({dispatch :requestData.dispatch })
    return response.data.data
  }
  console.log('responseresponseresponse', response);
  // if (requestData.dispatch) {
  //   requestData.dispatch(setSettings(response.data));
  // }
  // return response.data;
};

export const getSettings = async (requestData) => {
  // const requestOptions = {
  //   method: "GET",
  //   url: apiUrl + "/settings",
  //   headers: {
  //     "Content-Type": "application/json",
  //     Authorization: "Bearer " + user.token,
  //   },
  // };
  // var response = await axios(requestOptions);
  // if (requestData.dispatch) {
  //   requestData.dispatch(setSettings(response.data));
  // }
  // return response.data;
};

export const updateSettings = async (requestData) => {
  const requestOptions = {
    method: "POST",
    url: apiUrl + "/settings",
    data: requestData.params,
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer " + user.token,
    },
  };
  var response = await axios(requestOptions);
  requestData.dispatch(setSettings(response.data));
  return response.data;
};

export const changePasword = async (requestData) => {
  const requestOptions = {
    method: "POST",
    url: apiUrl + "/password",
    data: requestData.params,
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer " + user.token,
    },
  };
  var response = await axios(requestOptions);
  return response.data;
};

export const getPreview = async (requestData) => {
  console.log("samiReq", requestData);
  const requestOptions = {
    method: "POST",
    url: apiUrl + "/previews",
    data: requestData.params,
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer " + user.token,
    },
  };
  var response = await axios(requestOptions);
  requestData.dispatch(setSettings(response.data));
  return response.data;
};

export const getFootfallCount = async (requestData) => {
  const requestOptions = {
    method: "GET",
    url: apiUrl + "/footfall/total",
    params: requestData.params,
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer " + user.token,
    },
  };
  var response = await axios(requestOptions);
  return response.data;
};

export const getFootfall = async (requestData) => {
  const requestOptions = {
    method: "GET",
    url: apiUrl + "/footfall",
    params: requestData.params,
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer " + user.token,
    },
  };
  var response = await axios(requestOptions);
  console.log('responseresponse', response);
  return response.data;
};

export const getFootfallData = async (requestData) => {
  const requestOptions = {
    method: "POST",
    url: apiUrl + "/footfall/data",
    params: requestData.params,
    data: requestData.payload,
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer " + user.token,
    },
  };
  var response = await axios(requestOptions);
  console.log('responseresponse', response);
  return response.data;
};

export const getFootfallForIntrusion = async (requestData) => {
  const requestOptions = {
    method: "GET",
    url:
      apiUrl +
      `/footfall?_page=${requestData.params.currentPage}&_limit=${requestData.params.limit}`,
    params: requestData.params,
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer " + user.token,
    },
  };
  var response = await axios(requestOptions);
  return response.data;
};

export const deletePreviewsRecord = async (requestData) => {
  const requestOptions = {
    method: "DELETE",
    url: apiUrl + "/delete",
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer " + user.token,
    },
  };
  var response = await axios(requestOptions);
  return response.data;
};

export const addIdIntoBank = async (requestData) => {
  console.log('requestData', requestData);
  const requestOptions = {
    method: "POST",
    url: apiUrl + "/idBank",
    data: requestData.params,
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer " + user.token,
    },
  };
  let response = await axios(requestOptions)
  console.log('responseresponseresponse', response);
  return response;
};

export const getIdsFromBank = async () => {
  const requestOptions = {
    method: "GET",
    url: apiUrl + "/idBank",
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer " + user.token,
    },
  };
  let response = await axios(requestOptions)
  return response.data;
};

export const getAllSettings = async (requestData) => {
  const requestOptions = {
    method: "POST",
    url: apiUrl + "/getAllSettings",
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer " + user.token,
    },
  };
  var response = await axios(requestOptions);
  if ("dispatch" in requestData) {
    requestData.dispatch(setAllSettings(response.data.data));
  }
  return response.data;
};







// API Integration 

//LoginApi

export const login_user = async (obj) => {

  let resolved = {
    error: null,
    data: null
  }

  try {
    let res = await instance({
      url: '/login',
      method: 'POST',
      data: {
        email: obj.email,
        password: obj.password
      }
    })

    resolved.data = res.data
  } catch (error) {
    resolved.error = 'Something going wrong'
  }
  console.log('resolved', resolved);
  return resolved

}


// Add new location api

//Location Api

export const addLocationRequest = async (requestData) => {
  const requestOptions = {
    method: "POST",
    url: apiUrl + "/location",
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer " + user.token,
    },
    data: requestData
  };
  var response = await axios(requestOptions);
  console.log('responseresponse', response);


  return response;
};

export const fetchLocationRequest = async () => {
  const requestOptions = {
    method: "GET",
    url: apiUrl + "/location",
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer " + user.token,
    },
  };
  var response = await axios(requestOptions);
  return response;
};


// District Api
export const fetxhDistrictRequest = async () => {
  const requestOptions = {
    method: 'GET',
    url: apiUrl + '/district',
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer " + user.token,
    }
  };
  const response =await axios(requestOptions);
  console.log('responseresponse', response);
  return response
}


export const addDistrictRequest = async (requestData) => {

  const requestOptions = {
    method: 'POST',
    url: apiUrl + '/district',
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer " + user.token,
    },
    data: requestData
  };
  var response = await axios(requestOptions);
  console.log('distict_post', response);
  return response;
}


// City Api



export const fetxhCityRequest = async () => {
  const requestOptions = {
    method: 'GET',
    url: apiUrl + '/city',
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer " + user.token,
    }
  };
  const response =await axios(requestOptions);
  console.log('responseresponse', response);
  return response
}


export const addCityRequest = async (requestData) => {

  const requestOptions = {
    method: 'POST',
    url: apiUrl + '/city',
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer " + user.token,
    },
    data: requestData
  };
  var response = await axios(requestOptions);
  console.log('distict_post', response);
  return response;
}


// API for Step 1

export const add_step_1_Request = async (requestData) => {

  const requestOptions = {
    method: 'POST',
    url: apiUrl + '/job',
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer " + user.token,
    },
    data: requestData
  };
  var response = await axios(requestOptions);
  console.log('job_1', response);
  return response;
}


// API for Step 2 Videos

export const step_2_videos_Request = async (requestData) => {
  console.log('requestData',requestData);

  const requestOptions = {
    method: 'POST',
    url: apiUrl + '/video',
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer " + user.token,
    },
    data: requestData
  };
  var response = await axios(requestOptions);
  console.log('job_2', response);
  return response;
}


// API for Step 3 Region

export const addRegionsRequest = async (requestData) => {

  const requestOptions = {
    method: 'POST',
    url: apiUrl + '/region',
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer " + user.token,
    },
    data: requestData
  };
  var response = await axios(requestOptions);
  console.log('job_3', response);
  return response;
}


// API for Step 4 Region

export const addDirectionRequest = async (requestData) => {

  
  const requestOptions = {
    method: 'POST',
    url: apiUrl + '/direction',
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer " + user.token,
    },
    data: requestData
  };
  var response = await axios(requestOptions);
  console.log('job_4', response);
  return response;
}


export const fetxhregion = async () => {
  const requestOptions = {
    method: 'GET',
    url: apiUrl + '/region',
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer " + user.token,
    }
  };
  const response =await axios(requestOptions);
  console.log('responseresponse', response);
  return response
}

// fetch survey on region api

export const getSurveyRequest = async (requestData) => {
  const requestOptions = {
    method: "GET",
    url: apiUrl + "/job/"+requestData.job_id,
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer " + user.token,
    },
   
  };
  let response = await axios(requestOptions)
  return response.data;
};


export const surveyDeleteRequest = async (requestData) => {
  const requestOptions = {
    method: "DELETE",
    url: apiUrl + "/job/"+requestData.job_id,
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer " + user.token,
    },
   
  };
  let response = await axios(requestOptions)
  return response.data;
};


export const updateSurveryRequest = async (requestData) => {
  const requestOptions = {
    method: "PUT",
    url: apiUrl + "/job/"+requestData.job_id,
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer " + user.token,
    },
    data : requestData
   
  };
  let response = await axios(requestOptions)
  console.log('response',response);
  return response;
};




// fetch survey on summary api

export const fetchsurvey = async (requestData) => {
  const requestOptions = {
    method: "GET",
    url: apiUrl + "/job",
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer " + user.token,
    },
    data : requestData
  };
  let response = await axios(requestOptions)
  return response.data;
};




export const getDetailRequest = async (requestData) => {
  const requestOptions = {
    method: 'POST',
    url: apiUrl + '/metadata/getData',
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer " + user.token,
    },
    data: requestData
  };
  var response = await axios(requestOptions);
  if ("dispatch" in requestData) {
    if(response.data.status){
      requestData.dispatch(setDetails(response.data.data));
    }
    else {
      requestData.dispatch(setDetails(response.data));

    }
  }
  return response;
}


export const vehiclesRequest = async (requestData) => {
  const requestOptions = {
    method: "GET",
    url: apiUrl + "/vehicle",
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer " + user.token,
    },
    data : requestData
  };
  let response = await axios(requestOptions)
  return response.data;
};


export const updateVideoRequest = async (requestData) => {

  const requestOptions = {
    method: 'PUT',
    url: apiUrl + `/video/${requestData.video_id}`,
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer " + user.token,
    },
    data: requestData
  };
  var response = await axios(requestOptions);
  console.log('responseresponse', response);
  return response;
}

export const deleteMetaDataRequest = async (requestData) => {

  const requestOptions = {
    method: 'DELETE',
    url: apiUrl + `/metadata/job/${requestData.job_id}`,
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer " + user.token,
    },
  };
  var response = await axios(requestOptions);
  console.log('responseresponse', response);
  return response;
}














