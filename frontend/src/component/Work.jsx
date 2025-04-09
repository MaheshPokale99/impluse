import { useEffect, useRef, useState, memo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { FiImage, FiArrowRight, FiAlertCircle } from "react-icons/fi";

const Work = () => {
  const imageRefs = useRef([]);
  const containerRef = useRef(null);
  const [images, setImages] = useState([]);
  const [hoveredIndex, setHoveredIndex] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [supportsTransform3D, setSupportsTransform3D] = useState(false); // Default to false for better initial performance
  const backendUrl = import.meta.env.VITE_BACKEND_URL;
  const navigate = useNavigate();

  useEffect(() => {
    try {
      const el = document.createElement('div');
      const has3d = 'WebkitPerspective' in el.style ||
        'MozPerspective' in el.style ||
        'msPerspective' in el.style ||
        'OPerspective' in el.style ||
        'perspective' in el.style;
      setSupportsTransform3D(has3d);
    } catch (e) {
      console.error("3D transform check failed:", e);
      setSupportsTransform3D(false);
    }
  }, []);

  useEffect(() => {
    const controller = new AbortController();

    const fetchImages = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await axios.get(`${backendUrl}/api/images/image`);

        if (response.data && Array.isArray(response.data.images)) {
          setImages(response.data.images.slice(0, 3));
        } else {
          throw new Error("Invalid data format received");
        }
        setLoading(false);
      } catch (error) {
        if (error.name === 'AbortError') return;
        console.error("Error fetching images:", error);
        setError(error.message || "Failed to load images");
        setLoading(false);
      }
    };

    const timer = setTimeout(fetchImages, 100); 

    if (typeof window !== 'undefined' && 'IntersectionObserver' in window) {
      const observer = new IntersectionObserver(
        () => {
        },
        { threshold: 0.1, rootMargin: "100px" }
      );

      // Observe existing elements
      setTimeout(() => {
        imageRefs.current.forEach((img) => img && observer.observe(img));
      }, 100);

      return () => {
        observer.disconnect();
        clearTimeout(timer);
        controller.abort();
      };
    }

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [backendUrl]);

  useEffect(() => {
    if (!supportsTransform3D || !containerRef.current) return;

    let ticking = false;
    const handleMouseMove = (e) => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          if (containerRef.current) {
            const rect = containerRef.current.getBoundingClientRect();
            setMousePosition({
              x: e.clientX - rect.left,
              y: e.clientY - rect.top
            });
          }
          ticking = false;
        });
        ticking = true;
      }
    };

    containerRef.current.addEventListener('mousemove', handleMouseMove);
    return () => {
      if (containerRef.current) {
        containerRef.current.removeEventListener('mousemove', handleMouseMove);
      }
    };
  }, [supportsTransform3D]);

  // Simplified animation variants
  const fadeUpVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: (i) => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: i * 0.05, // Reduced delay between items
        duration: 0.4, // Faster animation
        ease: "easeOut"
      }
    })
  };

  // Optimized card transform calculation
  const calculateCardTransform = (cardIndex) => {
    if (!supportsTransform3D || hoveredIndex !== cardIndex) return {};
    if (!imageRefs.current[cardIndex]) return {};

    const rect = imageRefs.current[cardIndex].getBoundingClientRect();
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const x = mousePosition.x - centerX;
    const y = mousePosition.y - centerY;

    // Smaller rotation for better performance
    const rotateX = (y / rect.height) * 5;
    const rotateY = -(x / rect.width) * 5;

    return {
      rotateX,
      rotateY,
      transition: { type: "spring", stiffness: 200, damping: 25 }
    };
  };

  // Placeholder images with optimized loading
  const placeholderImages = Array(6).fill(null).map((_, i) => ({
    _id: `placeholder-${i}`,
    url: `https://placehold.co/400x500/eee/aaa?text=Image+${i + 1}`, // Using placehold.co for faster loading
    title: "Sample Project",
    category: "Example"
  }));

  // Determine which images to display
  const displayImages = images.length > 0 ? images : placeholderImages;

  const renderImages = () => {
    return displayImages.map((image, index) => (
      <motion.div
        key={image._id}
        ref={(el) => (imageRefs.current[index] = el)}
        variants={fadeUpVariants}
        custom={index + 4}
        whileHover={{ scale: 1.02, transition: { duration: 0.3 } }}
        onHoverStart={() => setHoveredIndex(index)}
        onHoverEnd={() => setHoveredIndex(null)}
        animate={supportsTransform3D ? calculateCardTransform(index) : {}}
        style={{ transformStyle: supportsTransform3D ? "preserve-3d" : "flat" }}
        className="group relative rounded-2xl overflow-hidden shadow-xl transform-gpu cursor-pointer"
      >
        {/* Simplified glow effect */}
        <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500 via-purple-500 to-indigo-500 rounded-2xl opacity-0 
          group-hover:opacity-100 blur-md transition-all duration-500" />

        <div className="relative bg-white dark:bg-gray-800 rounded-2xl overflow-hidden p-1"
          style={{ transform: supportsTransform3D ? "translateZ(0)" : "none" }}>
          <div className="relative overflow-hidden rounded-xl aspect-[4/5]">
            {/* Optimized image loading with lazy attribute */}
            <img
              src={image.url}
              alt={image.title || "Project image"}
              loading="lazy"
              decoding="async"
              className={`h-full w-full object-cover transition-transform duration-400 ${hoveredIndex === index ? 'scale-110' : 'scale-100'}`}
              style={{
                transformStyle: supportsTransform3D ? "preserve-3d" : "flat",
                transform: supportsTransform3D ? "translateZ(10px)" : "none"
              }}
            />

            {/* Interactive Overlay - simplified */}
            <div
              className={`absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent 
                flex flex-col items-center justify-end p-6 transition-opacity duration-300
                ${hoveredIndex === index ? 'opacity-100' : 'opacity-0'}`}
              style={{
                transformStyle: supportsTransform3D ? "preserve-3d" : "flat",
                transform: supportsTransform3D ? "translateZ(30px)" : "none"
              }}
            >
            </div>
          </div>

          <div className="p-4 bg-gradient-to-b from-white to-gray-50 dark:from-gray-800 dark:to-gray-900">
            <h3 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-500 bg-clip-text text-transparent mb-1"
              style={{
                transformStyle: supportsTransform3D ? "preserve-3d" : "flat",
                transform: supportsTransform3D ? "translateZ(5px)" : "none"
              }}
            >
              {image.title || "Creative Project"}
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400"
              style={{
                transformStyle: supportsTransform3D ? "preserve-3d" : "flat",
                transform: supportsTransform3D ? "translateZ(5px)" : "none"
              }}
            >
              {image.category || "Photography"}
            </p>
          </div>
        </div>
      </motion.div>
    ));
  };

  // Simplified background elements
  const backgroundElements = (
    <div className="absolute top-0 left-0 right-0 bottom-0 overflow-hidden pointer-events-none opacity-50">
      <div className="absolute -top-20 -right-20 w-80 h-80 bg-blue-400/20 dark:bg-blue-600/20 rounded-full blur-[100px]" />
      <div className="absolute -bottom-40 -left-20 w-96 h-96 bg-purple-400/20 dark:bg-purple-600/20 rounded-full blur-[100px]" />
      <div className="absolute top-1/2 left-1/3 w-64 h-64 bg-indigo-400/15 dark:bg-indigo-600/15 rounded-full blur-[80px]" />
    </div>
  );

  return (
    <div ref={containerRef} className="relative w-full max-w-7xl mx-auto py-2 px-6 md:px-8 overflow-hidden">
      {/* Simplified background */}
      {backgroundElements}

      <motion.header
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-50px" }}
        variants={fadeUpVariants}
        custom={0}
        className="mb-16 text-center relative z-10"
      >
        <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-500/20 to-indigo-500/20 
          backdrop-blur-md mx-auto mb-6 flex items-center justify-center shadow-xl">
          <FiImage className="w-8 h-8 text-blue-600 dark:text-blue-400" />
        </div>

        <h2 className="text-4xl lg:text-6xl font-bold mb-4 relative inline-block">
          <span className="bg-gradient-to-r from-blue-600 via-indigo-500 to-purple-500 bg-clip-text text-transparent">
            Creative Showcase
          </span>
          <div className="absolute -bottom-2 left-0 h-1 w-full bg-gradient-to-r from-blue-600 via-indigo-500 to-purple-500 rounded-full" />
        </h2>
        <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto text-xl font-light">
          Explore our stunning portfolio of innovative designs and creative solutions
        </p>
      </motion.header>

      <AnimatePresence mode="wait">
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="relative w-20 h-20">
              <div className="absolute inset-0 rounded-full border-4 border-blue-100 dark:border-blue-900/20"></div>
              <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-blue-600 dark:border-t-blue-400 animate-spin"></div>
            </div>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <FiAlertCircle className="text-5xl text-red-500 mb-4" />
            <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-2">
              Unable to load gallery
            </h3>
            <p className="text-gray-600 dark:text-gray-400 max-w-md mb-6">
              {error}
            </p>
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Try Again
            </button>
          </div>
        ) : (
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
            variants={fadeUpVariants}
            custom={3}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10 md:gap-12 relative z-10 perspective-1000"
          >
            {renderImages()}
          </motion.div>
        )}
      </AnimatePresence>

      {(displayImages.length > 0) && (
        <motion.div 
          variants={fadeUpVariants}
          custom={8}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="mt-16 flex justify-center relative z-10"
        >
          <motion.button
            onClick={() => navigate("/image-gallery")}
            whileHover={{ 
              scale: 1.05,
              boxShadow: "0 10px 25px -5px rgba(79, 70, 229, 0.4)"
            }}
            whileTap={{ scale: 0.95 }}
            className="custom-button relative overflow-hidden flex items-center justify-center gap-2 px-8 py-4 w-full md:w-[50%]"
          >
            <span className="relative z-10">Explore Gallery</span>
            <FiArrowRight className="relative z-10 transition-transform duration-300 group-hover:translate-x-1" />
            <span className="shine-effect"></span>
          </motion.button>
        </motion.div>
      )}
    </div>
  );
};

export default memo(Work);
