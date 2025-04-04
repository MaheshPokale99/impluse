import { useState, useRef } from "react";
import axios from "axios";
import TextInput from "../component/TextInput";
import toast, { Toaster } from "react-hot-toast";
import { MdFolderDelete, MdOutlineFileUpload, MdOutlineDescription, MdOutlineTitle, MdOutlineTag } from "react-icons/md";
import { LuUpload, LuImage } from "react-icons/lu";
import { HiOutlineCheck } from "react-icons/hi";

const UploadImage = () => {
    const [files, setFiles] = useState([]);
    const [applySameMetadata, setApplySameMetadata] = useState(true);
    const [commonMetadata, setCommonMetadata] = useState({ title: "", description: "", tags: "" });
    const [individualMetadata, setIndividualMetadata] = useState([]);
    const [loading, setLoading] = useState(false);
    const fileInputRef = useRef(null);
    const backendUrl = import.meta.env.VITE_BACKEND_URL;

    const handleFileChange = (e) => {
        const selectedFiles = Array.from(e.target.files);
        const uniqueFiles = selectedFiles.filter(
            (file) => !files.some((f) => f.name === file.name)
        );
        setFiles([...files, ...uniqueFiles]);
        setIndividualMetadata([
            ...individualMetadata,
            ...uniqueFiles.map(() => ({ title: "", description: "", tags: "" })),
        ]);
    };

    const removeFile = (index) => {
        const newFiles = files.filter((_, i) => i !== index);
        setFiles(newFiles);
        setIndividualMetadata(individualMetadata.filter((_, i) => i !== index));
    };

    const handleMetadataChange = (index, field, value) => {
        const newMetadata = [...individualMetadata];
        newMetadata[index][field] = value;
        setIndividualMetadata(newMetadata);
    };

    const handleUpload = async () => {
        if (files.length === 0) {
            toast.error("No files selected!");
            return;
        }

        setLoading(true);
        const formData = new FormData();
        files.forEach((file) => formData.append("images", file));
        formData.append("applySameMetadata", applySameMetadata);

        if (applySameMetadata) {
            formData.append("title", commonMetadata.title);
            formData.append("description", commonMetadata.description);
            formData.append("tags", JSON.stringify(commonMetadata.tags.split(",")));
        }
        else {
            formData.append(
                "metadata",
                JSON.stringify(
                    individualMetadata.map((meta) => ({
                        ...meta,
                        tags: meta.tags.split(","),
                    }))
                )
            );
        }

        try {
            const token = localStorage.getItem("token");
            await axios.post(`${backendUrl}/api/images/upload`, formData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                    Authorization: `Bearer ${token}`,
                },
            });
            toast.success(`Images uploaded successfully!`, { position: "top-center" });
            setFiles([]);
            setCommonMetadata({ title: "", description: "", tags: "" });
            setIndividualMetadata([]);
        }
        catch (error) {
            console.error("Upload Error:", error.response?.data || error.message);
            toast.error(error.response?.data?.message || "Upload failed. Please try again.");
        }
        finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen py-12 px-4 sm:px-6">
            <Toaster 
                position="top-right" 
                toastOptions={{
                    style: {
                        background: '#333',
                        color: '#fff',
                        borderRadius: '8px',
                    },
                }}
            />
            
            {loading && (
                <div className="fixed inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm z-50">
                    <div className="bg-white dark:bg-zinc-800 p-6 rounded-xl shadow-xl">
                        <div className="flex items-center">
                            <div className="h-6 w-6 border-2 border-t-blue-500 border-blue-200 rounded-full animate-spin mr-3"></div>
                            <p className="text-slate-700 dark:text-slate-200">Uploading images...</p>
                        </div>
                    </div>
                </div>
            )}

            <div className="max-w-4xl mx-auto">
                <div className="text-center mb-10">
                    <div className="inline-flex items-center justify-center w-14 h-14 bg-blue-100 dark:bg-blue-900/30 rounded-full mb-4">
                        <LuImage className="text-blue-600 dark:text-blue-400 text-2xl" />
                    </div>
                    <h1 className="text-3xl font-bold mb-2 text-slate-800 dark:text-white">
                        Upload Images
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400 max-w-md mx-auto">
                        Add beautiful images to the gallery with metadata and tags
                    </p>
                </div>
                
                <div className="bg-white dark:bg-zinc-800 rounded-xl shadow-md border border-slate-200 dark:border-slate-700 p-6 sm:p-8 mb-8">
                    {/* Upload Area */}
                    <div className="mb-8">
                        <div className="border-2 border-dashed border-slate-300 dark:border-slate-600 hover:border-blue-400 dark:hover:border-blue-500 rounded-xl p-6 sm:p-8 text-center transition-colors">
                            <input
                                ref={fileInputRef}
                                type="file"
                                multiple
                                onChange={handleFileChange}
                                accept="image/*"
                                className="hidden"
                                id="file-upload"
                            />
                            <div className="inline-flex items-center justify-center w-16 h-16 bg-slate-100 dark:bg-slate-700 rounded-full mb-4">
                                <MdOutlineFileUpload className="text-slate-500 dark:text-slate-400 text-3xl" />
                            </div>
                            <h3 className="text-lg font-medium text-slate-700 dark:text-slate-300 mb-2">
                                Drag & drop images here
                            </h3>
                            <p className="mb-4 text-slate-500 dark:text-slate-400">
                                or use the button below to browse your files
                            </p>
                            <button
                                onClick={() => fileInputRef.current.click()}
                                className="inline-flex items-center px-4 py-2.5 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors shadow-sm"
                            >
                                <LuUpload className="mr-2" />
                                Browse Files
                            </button>
                        </div>
                    </div>

                    {/* Image Preview */}
                    {files.length > 0 && (
                        <div className="mb-8">
                            <div className="flex justify-between items-center mb-5">
                                <h3 className="font-medium text-lg text-slate-800 dark:text-white flex items-center">
                                    <span className="flex items-center justify-center bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 w-6 h-6 rounded-full mr-2 text-sm">
                                        {files.length}
                                    </span>
                                    Selected Images
                                </h3>
                                <button
                                    onClick={() => {
                                        setFiles([]);
                                        setIndividualMetadata([]);
                                    }}
                                    className="text-sm px-3 py-1.5 text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-md transition-colors"
                                >
                                    Clear All
                                </button>
                            </div>
                            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                                {files.map((file, index) => (
                                    <div key={index} className="relative group">
                                        <div className="aspect-square bg-slate-100 dark:bg-slate-700 rounded-lg overflow-hidden shadow-sm transition-transform hover:shadow-md">
                                            <img
                                                src={URL.createObjectURL(file)}
                                                alt={file.name}
                                                className="w-full h-full object-cover"
                                            />
                                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                            <button
                                                onClick={() => removeFile(index)}
                                                className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-sm"
                                            >
                                                <MdFolderDelete />
                                            </button>
                                        </div>
                                        <p className="mt-2 text-xs text-slate-500 dark:text-slate-400 truncate">{file.name}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Metadata Settings */}
                    {files.length > 0 && (
                        <div className="mb-8">
                            <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-700/30 rounded-lg mb-6">
                                <div className="flex items-center">
                                    <span className="text-slate-700 dark:text-slate-300 font-medium">
                                        Apply same metadata to all images
                                    </span>
                                </div>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={applySameMetadata}
                                        onChange={() => setApplySameMetadata(!applySameMetadata)}
                                        className="sr-only peer"
                                    />
                                    <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-slate-600 peer-checked:bg-blue-500"></div>
                                </label>
                            </div>

                            {applySameMetadata ? (
                                <div className="space-y-5 bg-slate-50 dark:bg-slate-700/20 p-5 rounded-lg">
                                    <div>
                                        <label className="flex items-center gap-2 mb-2 text-sm font-medium text-slate-700 dark:text-slate-300">
                                            <MdOutlineTitle className="text-blue-500" />
                                            Title
                                        </label>
                                        <TextInput
                                            type="text"
                                            placeholder="Enter title"
                                            value={commonMetadata.title}
                                            onChange={(e) => setCommonMetadata({ ...commonMetadata, title: e.target.value })}
                                        />
                                    </div>
                                    <div>
                                        <label className="flex items-center gap-2 mb-2 text-sm font-medium text-slate-700 dark:text-slate-300">
                                            <MdOutlineDescription className="text-blue-500" />
                                            Description
                                        </label>
                                        <TextInput
                                            type="text"
                                            placeholder="Enter description"
                                            value={commonMetadata.description}
                                            onChange={(e) => setCommonMetadata({ ...commonMetadata, description: e.target.value })}
                                        />
                                    </div>
                                    <div>
                                        <label className="flex items-center gap-2 mb-2 text-sm font-medium text-slate-700 dark:text-slate-300">
                                            <MdOutlineTag className="text-blue-500" />
                                            Tags
                                        </label>
                                        <TextInput
                                            type="text"
                                            placeholder="Enter tags (comma separated)"
                                            value={commonMetadata.tags}
                                            onChange={(e) => setCommonMetadata({ ...commonMetadata, tags: e.target.value })}
                                        />
                                    </div>
                                </div>
                            ) : (
                                <div className="space-y-5 max-h-96 overflow-y-auto pr-2">
                                    {files.map((file, index) => (
                                        <div key={index} className="p-5 border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-700/20 hover:border-slate-300 dark:hover:border-slate-600 transition-colors">
                                            <div className="flex items-start gap-4 mb-4">
                                                <div className="h-16 w-16 shrink-0 bg-slate-200 dark:bg-slate-700 rounded-lg overflow-hidden">
                                                    <img
                                                        src={URL.createObjectURL(file)}
                                                        alt="preview"
                                                        className="h-full w-full object-cover"
                                                    />
                                                </div>
                                                <div>
                                                    <p className="text-sm font-medium text-slate-800 dark:text-slate-200">
                                                        {file.name}
                                                    </p>
                                                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                                                        {Math.round(file.size / 1024)} KB
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="space-y-3">
                                                <div>
                                                    <label className="flex items-center gap-1 mb-1.5 text-xs font-medium text-slate-700 dark:text-slate-300">
                                                        <MdOutlineTitle className="text-blue-500" /> Title
                                                    </label>
                                                    <TextInput
                                                        type="text"
                                                        placeholder="Enter title"
                                                        value={individualMetadata[index]?.title || ""}
                                                        onChange={(e) => handleMetadataChange(index, "title", e.target.value)}
                                                    />
                                                </div>
                                                <div>
                                                    <label className="flex items-center gap-1 mb-1.5 text-xs font-medium text-slate-700 dark:text-slate-300">
                                                        <MdOutlineDescription className="text-blue-500" /> Description
                                                    </label>
                                                    <TextInput
                                                        type="text"
                                                        placeholder="Enter description"
                                                        value={individualMetadata[index]?.description || ""}
                                                        onChange={(e) => handleMetadataChange(index, "description", e.target.value)}
                                                    />
                                                </div>
                                                <div>
                                                    <label className="flex items-center gap-1 mb-1.5 text-xs font-medium text-slate-700 dark:text-slate-300">
                                                        <MdOutlineTag className="text-blue-500" /> Tags
                                                    </label>
                                                    <TextInput
                                                        type="text"
                                                        placeholder="Enter tags (comma separated)"
                                                        value={individualMetadata[index]?.tags || ""}
                                                        onChange={(e) => handleMetadataChange(index, "tags", e.target.value)}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {/* Upload Button */}
                    <button
                        onClick={handleUpload}
                        disabled={files.length === 0 || loading}
                        className={`
                            w-full py-3 px-4 rounded-lg font-medium flex items-center justify-center transition-colors
                            ${files.length === 0 || loading
                                ? 'bg-slate-400 text-white cursor-not-allowed'
                                : 'bg-blue-500 text-white hover:bg-blue-600 shadow-sm'}
                        `}
                    >
                        {loading ? (
                            <>
                                <div className="h-5 w-5 border-2 border-t-white/20 border-white rounded-full animate-spin mr-2"></div>
                                <span>Uploading...</span>
                            </>
                        ) : (
                            <>
                                <HiOutlineCheck className="mr-2 text-lg" />
                                <span>{files.length > 0 ? `Upload ${files.length} Images` : 'Upload Images'}</span>
                            </>
                        )}
                    </button>
                </div>
                
                <div className="text-center text-sm text-slate-500 dark:text-slate-400">
                    <p>Supported formats: JPG, PNG, GIF, WEBP • Max size: 10MB per file</p>
                </div>
            </div>
        </div>
    );
};

export default UploadImage;
