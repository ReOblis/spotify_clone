import { useNavigate } from "react-router-dom"


const AlbumItem = ({image,name,desc,id}) => {

  const navigate = useNavigate()
  return (
     <div className="flex flex-col mr-4 w-48">
    <div onClick={()=>navigate(`/album/${id}`)} className="min-w-[180px] p-2 px-3 rounded cursor-pointer hover:bg-[#ffffff26]">
        <img className="rounded" src={image} alt="image" />
        <p className="font-bold mt-2 mb-1">{name}</p>
        <p className="text-slate-200 text-sm">{desc}</p>
    </div>
    </div>
  )
}

export default AlbumItem