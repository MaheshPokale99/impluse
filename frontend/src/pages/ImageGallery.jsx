import axios from "axios";
import { useContext, useEffect, useState, useRef } from "react";
import toast, { Toaster } from "react-hot-toast";
import { AuthContext } from "../context/AuthContext";
import { motion, AnimatePresence } from "framer-motion";

const ImageGallery = () => {
  const [images, setImages] = useState([]);
  const [selectedPublicIds, setSelectedPublicIds] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const backendUrl = import.meta.env.VITE_BACKEND_URL;
  const { user } = useContext(AuthContext);
  const [expanded, setExpanded] = useState({});
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTag, setActiveTag] = useState(null);
  const [viewMode, setViewMode] = useState("grid");
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const galleryRef = useRef(null);
  const [showWelcome, setShowWelcome] = useState(true);
  const [sortBy, setSortBy] = useState("newest");
  const [zoomedImage, setZoomedImage] = useState(null);
  const [imageScale, setImageScale] = useState(1);

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

  // Get all unique tags from images
  const allTags = [...new Set(images.flatMap(image => image.tags || []))];

  // Filter images based on selected tag and search term
  const filteredImages = images.filter(image => {
    const matchesTag = !activeTag || (image.tags && image.tags.includes(activeTag));
    const matchesSearch = !searchTerm ||
      image.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      image.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (image.tags && image.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase())));

    return matchesTag && matchesSearch;
  });

  // Select all functionality
  const handleSelectAll = () => {
    if (selectedPublicIds.length === filteredImages.length) {
      setSelectedPublicIds([]);
    } else {
      setSelectedPublicIds(filteredImages.map(img => img.public_id));
    }
  };

  // Handle image zoom
  const handleImageZoom = (image) => {
    setZoomedImage(image);
    setImageScale(1);
  };

  // Close zoomed image
  const closeZoom = () => {
    setZoomedImage(null);
  };

  // Close welcome banner
  const closeWelcome = () => {
    setShowWelcome(false);
    localStorage.setItem("welcomeClosed", "true");
  };

  // Sort images function
  const sortImages = (images) => {
    if (sortBy === "title") {
      return [...images].sort((a, b) => a.title.localeCompare(b.title));
    } else if (sortBy === "newest") {
      return [...images].sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
    }
    return images;
  };

  useEffect(() => {
    fetchImages();
    const welcomeClosed = localStorage.getItem("welcomeClosed");
    if (welcomeClosed) {
      setShowWelcome(false);
    }
  }, []);

  useEffect(() => {
    if (galleryRef.current) {
      galleryRef.current.scrollTo(0, 0);
    }
  }, [activeTag]);

  return (
    <div className="relative min-h-screen">
      {/* Enhanced Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-48 -right-48 w-96 h-96 bg-purple-200 dark:bg-purple-900/20 rounded-full filter blur-3xl opacity-30 animate-pulse"></div>
        <div className="absolute -bottom-48 -left-48 w-96 h-96 bg-blue-200 dark:bg-blue-900/20 rounded-full filter blur-3xl opacity-30 animate-pulse" style={{ animationDelay: "2s" }}></div>
        <div className="absolute top-1/4 left-1/3 w-64 h-64 bg-pink-200 dark:bg-pink-900/20 rounded-full filter blur-3xl opacity-20 animate-pulse" style={{ animationDelay: "3s" }}></div>
      </div>

      <div className="relative container mx-auto px-4 py-16 md:py-24">

        {/* Welcome Banner */}
        <AnimatePresence>
          {showWelcome && (
            <motion.div
              initial={{ opacity: 0, y: -50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -50 }}
              className="relative mb-8 bg-gradient-to-r from-blue-500/90 to-purple-600/90 backdrop-blur-lg rounded-2xl overflow-hidden shadow-2xl"
            >
              <div className="absolute inset-0 bg-grid-white/10 bg-grid-pattern opacity-10"></div>
              <div className="relative p-6 md:p-8 flex flex-col md:flex-row items-center gap-6">
                <div className="w-24 h-24 shrink-0 rounded-full bg-white/20 backdrop-blur flex items-center justify-center">
                  <svg className="w-12 h-12 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5"
                      d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <div className="flex-1 text-center md:text-left">
                  <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">Welcome to our Image Gallery!</h2>
                  <p className="text-blue-100 leading-relaxed">
                    Explore our stunning collection of curated images. Use tags to filter, or search by description.
                    Enjoy the seamless browsing experience with our enhanced gallery interface.
                  </p>
                </div>
                <button
                  onClick={closeWelcome}
                  className="absolute top-4 right-4 text-white/70 hover:text-white transition-colors"
                >
                  <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path d="M6 18L18 6M6 6l12 12" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl md:text-6xl font-extrabold mb-4 tracking-tight">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600">
              Image Gallery
            </span>
          </h1>
          <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto text-lg">
            Explore our curated collection of beautiful images
          </p>
        </motion.div>

        {/* Enhanced Search Bar and Controls */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="relative z-10 backdrop-blur-lg bg-white/70 dark:bg-gray-900/70 rounded-2xl shadow-xl p-4 mb-8 border border-gray-200/50 dark:border-gray-800/50"
        >
          <div className="flex flex-col md:flex-row gap-4 items-stretch">
            <div className="relative flex-grow">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-gray-400" viewBox="0 0 24 24" fill="none">
                  <path d="M21 21L15 15M17 10C17 13.866 13.866 17 10 17C6.13401 17 3 13.866 3 10C3 6.13401 6.13401 3 10 3C13.866 3 17 6.13401 17 10Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <input
                type="text"
                placeholder="Search by title, description or tags..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-white/50 dark:bg-gray-800/50 rounded-xl border border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm("")}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path d="M6 18L18 6M6 6l12 12" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>
              )}
            </div>

            <div className="flex flex-wrap gap-2">
              {/* Sort dropdown */}
              <div className="relative">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="appearance-none px-4 py-3 bg-white/50 dark:bg-gray-800/50 rounded-xl border border-gray-200 dark:border-gray-700 pr-10 hover:bg-white hover:dark:bg-gray-800 transition-all focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
                >
                  <option value="newest">Newest First</option>
                  <option value="title">Sort by Title</option>
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-500">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>

              <button
                onClick={() => setIsFilterOpen(!isFilterOpen)}
                className="px-4 py-3 bg-white/50 dark:bg-gray-800/50 rounded-xl border border-gray-200 dark:border-gray-700 hover:bg-white hover:dark:bg-gray-800 transition-all flex items-center gap-2"
              >
                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path d="M3 4h18M3 12h18M3 20h18" strokeWidth="2" strokeLinecap="round" />
                </svg>
                <span>Filters</span>
                {activeTag && (
                  <span className="bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300 text-xs font-medium rounded-full px-2 py-0.5">1</span>
                )}
              </button>

              <div className="flex rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`px-3 py-2 flex items-center ${viewMode === 'grid'
                    ? 'bg-purple-600 text-white'
                    : 'bg-white/50 dark:bg-gray-800/50 hover:bg-white hover:dark:bg-gray-800'} transition-all`}
                >
                  <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path d="M4 4H10V10H4V4Z M14 4H20V10H14V4Z M4 14H10V20H4V14Z M14 14H20V20H14V14Z" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>
                <button
                  onClick={() => setViewMode('masonry')}
                  className={`px-3 py-2 flex items-center ${viewMode === 'masonry'
                    ? 'bg-purple-600 text-white'
                    : 'bg-white/50 dark:bg-gray-800/50 hover:bg-white hover:dark:bg-gray-800'} transition-all`}
                >
                  <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path d="M3 3H10V12H3V3Z M14 3H21V8H14V3Z M14 12H21V21H14V12Z M3 16H10V21H3V16Z" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>
              </div>

              {user?.role === "admin" && (
                <button
                  onClick={handleSelectAll}
                  className="px-4 py-3 bg-white/50 dark:bg-gray-800/50 rounded-xl border border-gray-200 dark:border-gray-700 hover:bg-white hover:dark:bg-gray-800 transition-all flex items-center gap-2"
                >
                  <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path d="M9 11l3 3L22 4M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  <span>{selectedPublicIds.length === filteredImages.length && filteredImages.length > 0 ? 'Deselect All' : 'Select All'}</span>
                </button>
              )}
            </div>
          </div>

          {/* Tags Filter */}
          <AnimatePresence>
            {isFilterOpen && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700 overflow-hidden"
              >
                <div className="flex flex-wrap gap-2">
                  <motion.button
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.1 }}
                    onClick={() => setActiveTag(null)}
                    className={`px-3 py-2 rounded-full text-sm font-medium transition-all ${activeTag === null
                        ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/20'
                        : 'bg-white/50 dark:bg-gray-800/50 text-gray-700 dark:text-gray-300 hover:bg-purple-100 dark:hover:bg-purple-900/30'
                      }`}
                  >
                    All Images
                  </motion.button>

                  {allTags.map((tag, index) => (
                    <motion.button
                      key={tag}
                      initial={{ scale: 0.9, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ delay: 0.1 + (index * 0.05) }}
                      onClick={() => setActiveTag(tag === activeTag ? null : tag)}
                      className={`px-3 py-2 rounded-full text-sm font-medium transition-all ${tag === activeTag
                          ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/20'
                          : 'bg-white/50 dark:bg-gray-800/50 text-gray-700 dark:text-gray-300 hover:bg-purple-100 dark:hover:bg-purple-900/30'
                        }`}
                    >
                      #{tag}
                    </motion.button>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Enhanced Loader */}
        {loading && (
          <div className="fixed inset-0 z-50 bg-white/30 dark:bg-black/30 backdrop-blur-sm flex items-center justify-center">
            <div className="relative p-8 rounded-xl bg-white/10 backdrop-blur-md border border-white/20 flex flex-col items-center justify-center">

              <div className="relative h-24 w-24">
                <div className="absolute inset-0 rounded-full border-t-4 border-b-4 border-purple-500 animate-spin"></div>
                <div
                  className="absolute inset-0 rounded-full border-t-4 border-b-4 border-blue-500 animate-spin"
                  style={{ animationDelay: "0.3s" }}
                ></div>
                <div
                  className="absolute inset-0 rounded-full border-r-4 border-l-4 border-pink-500 animate-spin"
                  style={{ animationDelay: "0.6s" }}
                ></div>
              </div>

              {/* Text */}
              <p className="text-center mt-6 text-white font-medium">Loading amazing images...</p>
            </div>
          </div>
        )}


        {/* Content */}
        <div className="relative z-10">
          {error && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 px-6 py-4 rounded-xl mb-8 flex items-center gap-3"
            >
              <svg className="h-6 w-6 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>{error}</span>
            </motion.div>
          )}

          {filteredImages.length === 0 && !loading && !error && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white/70 dark:bg-gray-900/70 backdrop-blur-lg border border-gray-200 dark:border-gray-800 rounded-2xl p-12 text-center"
            >
              <div className="w-24 h-24 mx-auto mb-6 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center">
                <svg className="h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">No images found</h3>
              <p className="text-gray-500 dark:text-gray-400 max-w-md mx-auto">
                {searchTerm || activeTag
                  ? "Try adjusting your search criteria or filters to find what you're looking for."
                  : "There are no images in the gallery yet."}
              </p>
            </motion.div>
          )}

          {/* Enhanced Gallery Grid */}
          {filteredImages.length > 0 && (
            <div ref={galleryRef} className="overflow-y-auto">
              <div
                className={`
                  ${viewMode === 'grid'
                    ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 auto-rows-auto'
                    : 'columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-6 space-y-6'
                  }
                `}
              >
                {sortImages(filteredImages).map((image, index) => (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    key={image.public_id}
                    className={`
                      group relative rounded-2xl overflow-hidden bg-white dark:bg-gray-800 shadow-lg hover:shadow-xl transform transition-all duration-300 
                      ${viewMode === 'grid' ? '' : 'break-inside-avoid mb-6 inline-block w-full'}
                      ${selectedPublicIds.includes(image.public_id) ? 'ring-4 ring-purple-500 ring-offset-4 ring-offset-white dark:ring-offset-gray-900' : ''}
                      hover:-translate-y-1
                    `}
                  >
                    <div className="relative aspect-[4/3] overflow-hidden" onClick={() => handleImageZoom(image)}>
                      <img
                        src={image.url}
                        alt={image.title}
                        className="w-full h-full object-cover transform transition-all duration-700 group-hover:scale-110"
                        loading="lazy"
                      />

                      {/* Image Overlay with gradient */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300"></div>

                      {/* Actions on Hover */}
                      <div className="absolute bottom-0 left-0 right-0 p-4 translate-y-full group-hover:translate-y-0 transition-transform duration-300 flex justify-between items-center">
                        <h3 className="font-bold text-lg text-white truncate">{image.title}</h3>

                        {user?.role === "admin" && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleCheckboxChange(image.public_id);
                            }}
                            className={`
                              w-10 h-10 rounded-full flex items-center justify-center transition-all
                              ${selectedPublicIds.includes(image.public_id)
                                ? 'bg-purple-600 text-white'
                                : 'bg-white/20 text-white hover:bg-white/30 backdrop-blur-sm'}
                            `}
                          >
                            {selectedPublicIds.includes(image.public_id) ? (
                              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                                <path d="M5 12l5 5L20 7" strokeLinecap="round" strokeLinejoin="round" />
                              </svg>
                            ) : (
                              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M12 4v16m8-8H4" strokeLinecap="round" strokeLinejoin="round" />
                              </svg>
                            )}
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Content */}
                    <div className="p-5">
                      <p className="text-gray-600 dark:text-gray-300 mb-3">
                        {expanded[image.public_id] || image.description.length <= 100
                          ? image.description
                          : `${image.description.slice(0, 100)}... `}
                        {image.description.length > 100 && (
                          <button
                            onClick={() => toggleExpand(image.public_id)}
                            className="text-purple-600 dark:text-purple-400 font-medium hover:text-purple-700 dark:hover:text-purple-300 ml-1 inline-flex items-center"
                          >
                            {expanded[image.public_id] ? (
                              <>Show less <svg className="w-3 h-3 ml-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 15l-6-6-6 6" strokeLinecap="round" strokeLinejoin="round" /></svg></>
                            ) : (
                              <>Show more <svg className="w-3 h-3 ml-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 9l6 6 6-6" strokeLinecap="round" strokeLinejoin="round" /></svg></>
                            )}
                          </button>
                        )}
                      </p>

                      {image.tags && image.tags.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-3">
                          {image.tags.map((tag) => (
                            <span
                              key={tag}
                              onClick={() => setActiveTag(tag === activeTag ? null : tag)}
                              className={`
                                px-2.5 py-1 text-xs font-medium rounded-full cursor-pointer transition-all
                                ${tag === activeTag
                                  ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300'
                                  : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300 hover:bg-purple-50 dark:hover:bg-purple-900/20'
                                }
                              `}
                            >
                              #{tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          )}

          {/* Floating Delete Button */}
          {user?.role === "admin" && selectedPublicIds.length > 0 && (
            <motion.div
              initial={{ y: 100, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 100, opacity: 0 }}
              className="fixed bottom-8 left-1/2 transform -translate-x-1/2 z-30"
            >
              <button
                onClick={handleDelete}
                disabled={loading}
                className="flex items-center gap-2 px-6 py-3 rounded-full bg-gradient-to-r from-red-500 to-red-600 text-white shadow-lg shadow-red-500/30 hover:shadow-xl hover:shadow-red-500/40 transition-all hover:-translate-y-1"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                <span>Delete {selectedPublicIds.length} {selectedPublicIds.length === 1 ? 'Image' : 'Images'}</span>
              </button>
            </motion.div>
          )}
        </div>
      </div>

      {/* Image Zoom Modal */}
      <AnimatePresence>
        {zoomedImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4 md:p-8 backdrop-blur-sm"
            onClick={closeZoom}
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: imageScale }}
              className="relative max-w-full max-h-full overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <img
                src={zoomedImage?.url}
                alt={zoomedImage?.title}
                className="max-w-full max-h-[85vh] object-contain rounded-lg"
              />

              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-3 bg-black/50 backdrop-blur-sm rounded-full p-2">
                <button
                  onClick={() => setImageScale(Math.max(0.5, imageScale - 0.25))}
                  className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-white/20 transition-colors"
                >
                  <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path d="M20 12H4" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>
                <button
                  onClick={() => setImageScale(1)}
                  className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-white/20 transition-colors"
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path d="M4 8V4m0 0h4M4 4l5 5m11-5h-4m4 0v4m0-4l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5v-4m0 4h-4m4 0l-5-5" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>
                <button
                  onClick={() => setImageScale(Math.min(2, imageScale + 0.25))}
                  className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-white/20 transition-colors"
                >
                  <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path d="M12 4v16m8-8H4" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>
              </div>

              <button
                onClick={closeZoom}
                className="absolute top-4 right-4 w-10 h-10 rounded-full bg-black/50 flex items-center justify-center text-white hover:bg-black/70 transition-colors"
              >
                <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path d="M6 18L18 6M6 6l12 12" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>

              <div className="absolute top-4 left-4 max-w-[80%] bg-black/50 backdrop-blur-sm rounded-lg py-2 px-4 text-white">
                <h3 className="font-bold text-lg">{zoomedImage?.title}</h3>
                {zoomedImage?.tags && zoomedImage.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-1">
                    {zoomedImage.tags.map(tag => (
                      <span key={tag} className="text-xs bg-white/20 px-2 py-0.5 rounded-full">#{tag}</span>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: {
            background: 'rgba(0, 0, 0, 0.8)',
            color: '#fff',
            backdropFilter: 'blur(10px)',
            borderRadius: '10px',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            padding: '16px',
          },
        }}
      />
    </div>
  );
};

export default ImageGallery;