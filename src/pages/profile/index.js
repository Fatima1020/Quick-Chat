import moment from "moment";
import { useEffect } from "react";
import { useDispatch,useSelector } from "react-redux";
import { hideLoader, showLoader } from "../../redux/loaderSlice";
import toast from "react-hot-toast";
import { setUser } from "../../redux/usersSlice"
import { useState } from "react";
import { uploadProfilePic } from "../../apiCalls/users";


function Profile(){
    const { user } = useSelector(state => state.userReducer);
    const [image, setImage] = useState('');
    const dispatch = useDispatch();

    useEffect(() => {
        if(user?.profilePic){
            setImage(user.profilePic);
        }
    }, [user])

    function getInitials(){
        if(!user?.firstname || !user?.lastname) return "";
        let f = user?.firstname.toUpperCase()[0];
        let l = user?.lastname.toUpperCase()[0];
        return f + l;
    }

    function getFullname(){
        if(!user?.firstname || !user?.lastname) return "";
        let f = user?.firstname.toUpperCase();
        let l = user?.lastname.toUpperCase();
        return f + ' ' + l;
    }

    const onFileSelect = async (e) => {
        const file = e.target.files[0];
        const reader = new FileReader(file);

        reader.readAsDataURL(file);

        reader.onloadend = async () =>{
            setImage(reader.result);
        }
    }

    const updateProfilePic = async () => {
        
        try{
            dispatch(showLoader())
            const response = await uploadProfilePic(image);
            dispatch(hideLoader());

            if(response.success){
                toast.success(response.message);
                dispatch(setUser(response.data));
            }else{
                toast.error(response.message);
            }
        }catch(err){
            toast.error(err.message);
            dispatch(hideLoader());
        }
    }

    return (
        <div className="profile-page-container">
        <div className="profile-pic-container">
            {image && <img src={image} 
                 alt="Profile Pic" 
                 class="user-profile-pic-upload" 
            />}
            {!image && <div className="user-default-profile-avatar">
                { getInitials() }
            </div>}
        </div>

        <div className="profile-info-container">
            <div className="user-profile-name">
                {<h1>{ getFullname() }</h1>}
            </div>
            <div>
                <b>Email: </b>{user?.email}
            </div>
            <div>
                <b>Account Created: </b>{moment(user?.createdAt).format('MMM DD, YYYY')}
            </div>
            <div className="select-profile-pic-container">
                <input type="file" onChange={ onFileSelect } />
                <button className="upload-image-btn" onClick={updateProfilePic}>
                    Upload
                </button>
            </div>
        </div>
    </div>
    )
}

export default Profile;