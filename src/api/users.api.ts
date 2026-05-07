import axios, {AxiosResponse} from 'axios';
import { StudentInterface} from "@/pages/interfaces/student.interface.ts";

// see how to make these 2 generic
type CreateStudentDto = Omit<StudentInterface, 'id'>;
type UpdateStudentDto = Partial<CreateStudentDto>;

const baseUrl = import.meta.env.VITE_API_URL;

export const getStudents = (schoolId: string): Promise<AxiosResponse<StudentInterface[]>> => axios.get(`${baseUrl}/students/${schoolId}`);
export const updateStudent = (id: string, data: UpdateStudentDto): Promise<AxiosResponse<StudentInterface>> => axios.put(`${baseUrl}/students/${id}`, data);
export const createStudent = (data: CreateStudentDto): Promise<AxiosResponse<StudentInterface>> => axios.post(`${baseUrl}/students`, data);
export const deleteStudent = (id: string): Promise<AxiosResponse<void>> => axios.delete(`${baseUrl}/students/${id}`);

export const getUserWithProfile = async (userId: string): Promise<AxiosResponse<StudentInterface>> => {
    const res = await axios.get(`${baseUrl}/users/get-user-with-profile/${userId}`);
    return res.data;
};

export const getUserByEmail = async (email: string): Promise<AxiosResponse<any>> => {
    return axios.get(`${baseUrl}/users/get-by-email/${email}`);
};