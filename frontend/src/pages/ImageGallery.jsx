import axios from "axios";
import { useContext, useEffect, useState } from "react";
import toast, { Toaster } from "react-hot-toast";
import { AuthContext } from "../context/AuthContext";

const ImageGallery = () => {
  const [images, setImages] = useState([]);
  const [selectedPublicIds, setSelectedPublicIds] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const backendUrl = import.meta.env.VITE_BACKEND_URL;
  const { user } = useContext(AuthContext);
  const [expanded, setExpanded] = useState({});

  // Fetch Images from the backend
  const fetchImages = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await axios.get(`${backendUrl}/api/images/image`);
      setImages(data.images);
    } catch (error) {
      setError("Error fetching images, please try again later.");
      toast.error("Error fetching images, please try again later.");
    } finally {
      setLoading(false);
    }
  };

  // delete Image
  const handleDelete = async () => {
    if (selectedPublicIds.length === 0) {
      toast.warning("No images selected");
      return;
    }
    setLoading(true);
    setError(null);

    try {
      await axios.delete(`${backendUrl}/api/images/delete-image`, {
        data: { imageIds: selectedPublicIds },
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      toast.success("Images deleted successfully!");
      setImages((prevImages) =>
        prevImages.filter((image) => !selectedPublicIds.includes(image.public_id))
      );
      setSelectedPublicIds([]);
    } catch (error) {
      setError("Error deleting images, please try again later.");
      toast.error("Error deleting images, please try again later.");
    } finally {
      setLoading(false);
    }
  };

  const handleCheckboxChange = (publicId) => {
    setSelectedPublicIds((prevSelected) =>
      prevSelected.includes(publicId)
        ? prevSelected.filter((id) => id !== publicId)
        : [...prevSelected, publicId]
    );
  };

  const toggleExpand = (publicId) => {
    setExpanded((prev) => ({ ...prev, [publicId]: !prev[publicId] }));
  };

  useEffect(() => {
    fetchImages();
  }, []);

  return (
    <div className="relative container mx-auto p-8 pt-28">
      
      <h2 className="text-3xl font-semibold mb-6 text-center">Image Gallery</h2>

      {/* Loader */}
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center z-50">
          <div className="loader"></div>
        </div>
      )}

      {/* Content */}
      <div>
        {error && <div className="text-center text-red-500">{error}</div>}
        {images.length === 0 && !loading && !error && (
          <div className="text-center text-gray-500">No images to display</div>
        )}

        {/* Centered Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {images.map((image) => (
            <div
              key={image.public_id}
              className="card dark:bg-zinc-800 bg-zinc-100 rounded-2xl shadow-lg overflow-hidden"
            >
              <img
                src={image.url}
                alt={image.title}
                className="w-full h-72 object-cover"
              />
              <div className="p-4">
                <h3 className="font-semibold text-lg">{image.title}</h3>
                <p className="text-gray-400 text-sm">
                  {expanded[image.public_id] || image.description.length <= 50
                    ? image.description
                    : `${image.description.slice(0, 50)}... `}
                  {image.description.length > 50 && (
                    <button
                      onClick={() => toggleExpand(image.public_id)}
                      className="text-blue-500 text-sm font-medium ml-1"
                    >
                      {expanded[image.public_id] ? "See Less" : "See More"}
                    </button>
                  )}
                </p>

                {image.tags && image.tags.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-2">
                    {image.tags.map((tag) => (
                      <span
                        key={tag}
                        className="px-2 py-1 text-xs font-semibold bg-blue-100 text-blue-600 rounded-md cursor-pointer"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}

                {/* Render checkbox only for admins */}
                {user?.role === "admin" && (
                  <label className="flex items-center mt-2 cursor-pointer space-x-2">
                    <input
                      type="checkbox"
                      checked={selectedPublicIds.includes(image.public_id)}
                      onChange={() => handleCheckboxChange(image.public_id)}
                      className="hidden peer"
                    />
                    <div className="w-5 h-5 border-2 border-gray-400 rounded-md flex items-center justify-center peer-checked:border-blue-500 peer-checked:bg-blue-500 transition-all">
                      <svg
                        className="w-4 h-4 text-white opacity-0 peer-checked:opacity-100 transition-all"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="3"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M5 12l4 4L19 7" />
                      </svg>
                    </div>
                    <span className="text-sm">Select</span>
                  </label>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Delete Button (Only for Admins) */}
        {user?.role === "admin" && (
          <div className="flex justify-center mt-6">
            <button
              onClick={handleDelete}
              className={`px-6 py-2 text-white rounded-lg focus:outline-none transition-all ${!selectedPublicIds.length || loading
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-red-600 hover:bg-red-700"
                }`}
              disabled={!selectedPublicIds.length || loading}
            >
              {loading ? "Deleting..." : "Delete Selected Images"}
            </button>
          </div>
        )}
      </div>
      <Toaster position="top-right" reverseOrder={false} />
    </div>
  );
};

export default ImageGallery;

