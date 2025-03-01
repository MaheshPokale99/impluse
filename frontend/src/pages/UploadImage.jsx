import { useState } from "react";
import axios from "axios";
import TextInput from "../component/TextInput";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { MdFolderDelete } from "react-icons/md";


const ImageUpload = () => {
    const [files, setFiles] = useState([]);
    const [applySameMetadata, setApplySameMetadata] = useState(true);
    const [commonMetadata, setCommonMetadata] = useState({ title: "", description: "", tags: "" });
    const [individualMetadata, setIndividualMetadata] = useState([]);
    const [loading, setLoading] = useState(false);
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
        <div className="flex items-center justify-center min-h-screen pt-32">
            <ToastContainer />
            {loading && (
                <div className="absolute inset-0 flex items-center justify-center z-50">
                    <div className="loader"></div>
                </div>
            )}

            <div className="max-w-lg w-full mx-auto p-6 bg-white dark:bg-zinc-900 shadow-xl rounded-lg">
                <label className="block w-full cursor-pointer">
                    <span className="block text-gray-700 dark:text-gray-300 font-medium mb-2">Upload Images</span>
                    <input
                        type="file"
                        multiple
                        onChange={handleFileChange}
                        accept="image/*"
                        className="hidden"
                    />
                    <div className="w-full p-4 border-2 border-dashed border-blue-400 rounded-md text-center text-gray-500 dark:text-gray-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 cursor-pointer">
                        Click to upload images
                    </div>
                </label>

                {/* Preview Section */}
                {files.length > 0 && (
                    <div className="mt-4 grid grid-cols-3 gap-4 overflow-y-auto max-h-60">
                        {files.map((file, index) => (
                            <div key={index} className="relative">
                                <img
                                    src={URL.createObjectURL(file)}
                                    alt="preview"
                                    className="h-24 w-24 object-cover rounded-lg cursor-pointer mx-auto"
                                    onClick={() => removeFile(index)}
                                />
                                
                                <MdFolderDelete 
                                    className="absolute top-0 text-red-500 hover:text-red-600 text-3xl cursor-pointer ml-5"
                                    onClick={() => removeFile(index)}
                                />
                            </div>
                        ))}
                    </div>
                )}

                <label className="flex items-center mt-4">
                    <input
                        type="checkbox"
                        checked={applySameMetadata}
                        onChange={() => setApplySameMetadata(!applySameMetadata)}
                        className="mr-2 h-4 w-4"
                    />
                    <span className="text-gray-700 dark:text-gray-300">Apply same title, description, and tags to all images</span>
                </label>

                {applySameMetadata ? (
                    <div className="mt-4 space-y-3">
                        <TextInput
                            type="text"
                            placeholder="Title"
                            value={commonMetadata.title}
                            onChange={(e) => setCommonMetadata({ ...commonMetadata, title: e.target.value })}
                        />
                        <TextInput
                            type="text"
                            placeholder="Description"
                            value={commonMetadata.description}
                            onChange={(e) => setCommonMetadata({ ...commonMetadata, description: e.target.value })}
                        />
                        <TextInput
                            type="text"
                            placeholder="Tags (comma separated)"
                            value={commonMetadata.tags}
                            onChange={(e) => setCommonMetadata({ ...commonMetadata, tags: e.target.value })}
                        />
                    </div>
                ) : (
                    <div className="mt-4 p-3 border rounded-lg dark:border-gray-700 overflow-y-auto max-h-72">
                        {files.map((file, index) => (
                            <div key={index} className="mb-4 p-3 border rounded-lg dark:border-gray-600 bg-gray-50 dark:bg-zinc-800">
                                <p className="text-gray-700 dark:text-gray-300 font-medium mb-3">{file.name}
                                    <MdFolderDelete 
                                        className="text-red-500 hover:text-red-600 text-3xl cursor-pointer"
                                        onClick={() => removeFile(index)}
                                    />
                                </p>
                                <TextInput
                                    type="text"
                                    placeholder="Title"
                                    value={individualMetadata[index]?.title || ""}
                                    onChange={(e) => handleMetadataChange(index, "title", e.target.value)}
                                />
                                <TextInput
                                    type="text"
                                    placeholder="Description"
                                    value={individualMetadata[index]?.description || ""}
                                    onChange={(e) => handleMetadataChange(index, "description", e.target.value)}
                                />
                                <TextInput
                                    type="text"
                                    placeholder="Tags (comma separated)"
                                    value={individualMetadata[index]?.tags || ""}
                                    onChange={(e) => handleMetadataChange(index, "tags", e.target.value)}
                                />
                            </div>
                        ))}
                    </div>
                )}

                <button 
                    onClick={handleUpload} 
                    disabled={files.length === 0 || loading} 
                    className="mt-4 w-full p-3 bg-blue-500 dark:bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-600 dark:hover:bg-blue-700 transition-all disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                    {loading ? "Uploading..." : "Upload"}
                </button>
            </div>
        </div>
    );
};

export default ImageUpload;
