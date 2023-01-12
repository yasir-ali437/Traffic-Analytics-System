import axios from 'axios';

const instance = axios.create({
baseURL:'http://192.168.10.41:5005/'
});

export default instance