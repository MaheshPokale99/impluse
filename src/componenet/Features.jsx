import { useEffect, useState } from "react"

const Features = () => {
  const [data, setData]=useState([]);

  useEffect(()=>{
    const ferchData=async()=>{
      try{
        const response=await fetch("/data.json");
        const result=await response.json();
        setData(result);
      }
      catch(error){
        console.log(error);
      }
    };
    ferchData();
  },[]);

  return (
    <div className="grid sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-4 p-28">
      {
        data.map((item,index)=>(
          <div key={index}
            className="relative flex items-center justify-center h-96 w-96 rounded-full border-2 border-gray-500 cursor-pointer
                      font-bold text-5xl z-10 -m-2 
                       xl:h-[435px] xl:w-[435px]
                       lg:h-[486px] lg:w-[486px]
                       md:h-[389px] md:w-[389px]">
            <span>{item.name}</span>
            <img src={item.image} alt={item.name} 
                className="absolute inset-0 w-full h-full object-fill opacity-0 hover:opacity-100 hover:scale-110 transition-transform duration-300 ease-in-out"/>
          </div>
        ))
      }
    </div>
  )
}

export default Features