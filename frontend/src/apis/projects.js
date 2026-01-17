import axios from '../config/axiosConfig';

export const createProjectApi = async (options = {}) => {
    try {
        const { framework, name } = options;
        const response = await axios.post('/api/v1/projects', {
            framework,
            name
        });
        console.log(response.data);
        return response.data;
    } catch(error) {
        console.log(error);
        throw error;
    }
}

export const getProjectTree = async ({ projectId }) => {
    try {
        const response = await axios.get(`/api/v1/projects/${projectId}/tree`);
        console.log(response.data);
        return response?.data?.data;
    } catch(error) {
        console.log(error);
        throw error;
    }
}