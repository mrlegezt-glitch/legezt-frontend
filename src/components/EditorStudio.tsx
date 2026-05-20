"use client";

import { useState, useRef, useEffect } from "react";
import { jsPDF } from "jspdf";
import { 
  Image as ImageIcon, 
  MoveLeft, 
  MoveRight, 
  Trash2, 
  Edit3, 
  Sparkles, 
  Plus, 
  Check, 
  FileText, 
  X, 
  Type, 
  Edit2, 
  Eraser, 
  Download, 
  Share2, 
  FolderPlus 
} from "lucide-react";

interface EditorImage {
  id: string;
  name: string;
  originalUrl: string;
  processedUrl: string;
  filter: "none" | "magic" | "grayscale";
  width: number;
  height: number;
}

interface EditorStudioProps {
  onClose: () => void;
  onUploadSuccess: () => void;
  uploaderRole: "admin" | "faculty";
}

export default function EditorStudio({ onClose, onUploadSuccess, uploaderRole }: EditorStudioProps) {
  const [images, setImages] = useState<EditorImage[]>([]);
  const [activeImageId, setActiveImageId] = useState<string | null>(null);
  
  // Targeting / Metadata
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("Notes");
  const [targetYear, setTargetYear] = useState("all");
  const [targetBranch, setTargetBranch] = useState("all");
  const [targetBatch, setTargetBatch] = useState("all");
  const [isPublic, setIsPublic] = useState(true);
  
  // Watermark Settings
  const [useWatermark, setUseWatermark] = useState(false);
  const [watermarkText, setWatermarkText] = useState("LIET PORTAL");

  // Drawing Canvas States
  const [canvasTool, setCanvasTool] = useState<"draw" | "text" | "erase">("draw");
  const [brushColor, setBrushColor] = useState("#ff0000");
  const [brushWidth, setBrushWidth] = useState(5);
  const [textInput, setTextInput] = useState("");
  const [textModeActive, setTextModeActive] = useState(false);
  const [textCoords, setTextCoords] = useState({ x: 0, y: 0 });

  const [isGenerating, setIsGenerating] = useState(false);
  const [uploadProgress, setUploadProgress] = useState("");

  const fileInputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const isDrawingRef = useRef(false);
  const lastCoordsRef = useRef({ x: 0, y: 0 });

  const activeImage = images.find(img => img.id === activeImageId);

  // File uploading to local list
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const filesArray = Array.from(e.target.files);
    
    filesArray.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (!event.target?.result) return;
        const img = new Image();
        img.onload = () => {
          const newImg: EditorImage = {
            id: Math.random().toString(36).substring(2, 9),
            name: file.name,
            originalUrl: event.target!.result as string,
            processedUrl: event.target!.result as string,
            filter: "none",
            width: img.width,
            height: img.height
          };
          setImages(prev => [...prev, newImg]);
        };
        img.src = event.target.result as string;
      };
      reader.readAsDataURL(file);
    });
    
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  // Reordering
  const moveImage = (index: number, direction: "left" | "right") => {
    if (direction === "left" && index === 0) return;
    if (direction === "right" && index === images.length - 1) return;

    const targetIndex = direction === "left" ? index - 1 : index + 1;
    const updated = [...images];
    const temp = updated[index];
    updated[index] = updated[targetIndex];
    updated[targetIndex] = temp;
    setImages(updated);
  };

  const removeImage = (id: string) => {
    setImages(prev => prev.filter(img => img.id !== id));
    if (activeImageId === id) setActiveImageId(null);
  };

  // Magic White CamScanner-like Filter
  const applyMagicFilter = (img: EditorImage, type: "none" | "magic" | "grayscale") => {
    const tempImg = new Image();
    tempImg.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      
      ctx.drawImage(tempImg, 0, 0);
      
      if (type === "magic" || type === "grayscale") {
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;
        
        for (let i = 0; i < data.length; i += 4) {
          const r = data[i];
          const g = data[i+1];
          const b = data[i+2];
          
          // Grayscale formula
          let gray = 0.299 * r + 0.587 * g + 0.114 * b;
          
          if (type === "magic") {
            // Document Scanner Contrast stretch (CamScanner Style)
            if (gray > 130) {
              gray = Math.min(255, gray * 1.35); // White background boost
            } else {
              gray = Math.max(0, gray * 0.75); // Darken handwritten ink
            }
          }
          
          data[i] = gray;
          data[i+1] = gray;
          data[i+2] = gray;
        }
        ctx.putImageData(imageData, 0, 0);
      }
      
      setImages(prev => prev.map(item => {
        if (item.id === img.id) {
          return { ...item, filter: type, processedUrl: canvas.toDataURL("image/jpeg", 0.95) };
        }
        return item;
      }));
    };
    tempImg.src = img.originalUrl;
  };

  // Canvas Drawing Initializer
  useEffect(() => {
    if (!activeImage || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const img = new Image();
    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);
    };
    img.src = activeImage.processedUrl;
  }, [activeImageId]);

  // Drawing event handlers
  const getCanvasCoords = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    
    // Scale coords to actual canvas size, not CSS size
    const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
    const clientY = "touches" in e ? e.touches[0].clientY : e.clientY;
    
    const x = ((clientX - rect.left) / rect.width) * canvas.width;
    const y = ((clientY - rect.top) / rect.height) * canvas.height;
    return { x, y };
  };

  const handleStartDraw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (textModeActive) return;
    const coords = getCanvasCoords(e);
    isDrawingRef.current = true;
    lastCoordsRef.current = coords;
  };

  const handleDraw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawingRef.current || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const coords = getCanvasCoords(e);
    ctx.beginPath();
    ctx.moveTo(lastCoordsRef.current.x, lastCoordsRef.current.y);
    ctx.lineTo(coords.x, coords.y);
    
    if (canvasTool === "erase") {
      ctx.globalCompositeOperation = "destination-out"; // Transparent eraser
      ctx.lineWidth = brushWidth * 3;
    } else {
      ctx.globalCompositeOperation = "source-over";
      ctx.strokeStyle = brushColor;
      ctx.lineWidth = brushWidth;
    }
    
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.stroke();
    
    lastCoordsRef.current = coords;
  };

  const handleStopDraw = () => {
    isDrawingRef.current = false;
  };

  // Text Tool Placement
  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (canvasTool !== "text") return;
    const coords = getCanvasCoords(e);
    setTextCoords(coords);
    setTextModeActive(true);
    setTextInput("");
  };

  const applyTextToCanvas = () => {
    if (!canvasRef.current || !textInput) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.globalCompositeOperation = "source-over";
    // Scale font size based on image width to keep it looking proportional
    const scaleFontSize = Math.max(16, Math.round(canvas.width * 0.03));
    ctx.font = `bold ${scaleFontSize}px Arial`;
    ctx.fillStyle = brushColor;
    ctx.fillText(textInput, textCoords.x, textCoords.y);
    
    setTextModeActive(false);
    setTextInput("");
  };

  // Commit canvas edits
  const saveCanvasEdits = () => {
    if (!canvasRef.current || !activeImageId) return;
    const dataUrl = canvasRef.current.toDataURL("image/jpeg", 0.95);
    
    setImages(prev => prev.map(img => {
      if (img.id === activeImageId) {
        return { ...img, processedUrl: dataUrl };
      }
      return img;
    }));
    setActiveImageId(null);
  };

  // Generate final PDF and upload
  const compileAndUploadPdf = async () => {
    if (images.length === 0) {
      alert("Please add at least one image to build a PDF!");
      return;
    }
    if (!title.trim()) {
      alert("Please enter a Document Title!");
      return;
    }

    setIsGenerating(true);
    setUploadProgress("Compiling high-quality PDF...");

    try {
      // 1. Compile PDF using jsPDF
      const pdf = new jsPDF("p", "mm", "a4");
      
      for (let i = 0; i < images.length; i++) {
        if (i > 0) pdf.addPage();
        
        const img = images[i];
        
        // standard A4 dimensions in mm
        const a4Width = 210;
        const a4Height = 297;
        
        pdf.addImage(img.processedUrl, "JPEG", 0, 0, a4Width, a4Height);
        
        // Add watermark if selected
        if (useWatermark && watermarkText) {
          pdf.saveGraphicsState();
          pdf.setFont("Helvetica", "bold");
          pdf.setFontSize(40);
          pdf.setTextColor(180, 180, 180);
          // 45 degrees angle in the center of the A4 page
          pdf.text(watermarkText, a4Width / 2, a4Height / 2, {
            align: "center",
            angle: 45
          });
          pdf.restoreGraphicsState();
        }
      }

      setUploadProgress("Uploading to Azure Storage...");

      const pdfBlob = pdf.output("blob");
      const pdfFile = new File([pdfBlob], `${title.replace(/\s+/g, "_")}.pdf`, { type: "application/pdf" });

      // 2. Prepare FormData
      const fd = new FormData();
      fd.append("file", pdfFile);
      fd.append("title", title);
      fd.append("description", description);
      fd.append("category", category);
      fd.append("isPublic", String(isPublic));
      if (targetYear !== "all") fd.append("year", targetYear);
      if (targetBranch !== "all") fd.append("branch", targetBranch);
      if (targetBatch !== "all") fd.append("batch", targetBatch);

      // 3. Make POST request (handles proxy mapping correctly)
      const uploadUrl = uploaderRole === "admin" ? "/api/documents" : "/api/documents";
      const res = await fetch(uploadUrl, {
        method: "POST",
        body: fd
      });

      if (res.ok) {
        setUploadProgress("Completed!");
        alert("PDF generated and distributed successfully!");
        onUploadSuccess();
        onClose();
      } else {
        const err = await res.json();
        alert(`Upload failed: ${err.error || "Unknown server error"}`);
      }
    } catch (err) {
      console.error(err);
      alert("Error compiling or uploading PDF.");
    } finally {
      setIsGenerating(false);
      setUploadProgress("");
    }
  };

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        backgroundColor: "rgba(6, 6, 6, 0.96)",
        backdropFilter: "blur(20px)",
        zIndex: 10000,
        display: "flex",
        color: "#f8fafc",
        fontFamily: "system-ui, -apple-system, sans-serif"
      }}
    >
      {/* Sidebar - Target distribution parameters */}
      <div
        style={{
          width: "360px",
          borderRight: "1px solid rgba(255,255,255,0.06)",
          padding: "24px",
          display: "flex",
          flexDirection: "column",
          gap: "20px",
          overflowY: "auto",
          backgroundColor: "rgba(255,255,255,0.01)"
        }}
      >
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: "8px" }}>
            <span style={{ fontSize: "1.5rem" }}>🎨</span>
            <h2 style={{ fontSize: "1.25rem", fontWeight: "bold", margin: 0 }}>Editor Studio</h2>
          </div>
          <p style={{ fontSize: "0.75rem", color: "#94a3b8", margin: 0 }}>
            ILovePDF & MS Office style document scanner and annotation pipeline.
          </p>
        </div>

        {/* Target Parameters */}
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          <div style={{ fontSize: "0.85rem", fontWeight: 600, color: "#cbd5e1" }}>1. Metadata & Details</div>
          
          <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
            <label style={{ fontSize: "0.75rem", color: "#94a3b8" }}>Document Title *</label>
            <input 
              type="text" 
              placeholder="e.g. Unit 2 Mechanics Notes" 
              value={title} 
              onChange={e => setTitle(e.target.value)}
              style={{
                backgroundColor: "rgba(255,255,255,0.03)",
                border: "1px solid rgba(255,255,255,0.08)",
                borderRadius: "6px",
                padding: "10px",
                color: "#fff",
                fontSize: "0.85rem"
              }}
            />
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
            <label style={{ fontSize: "0.75rem", color: "#94a3b8" }}>Description (Optional)</label>
            <textarea 
              placeholder="Brief summary..." 
              value={description} 
              onChange={e => setDescription(e.target.value)}
              style={{
                backgroundColor: "rgba(255,255,255,0.03)",
                border: "1px solid rgba(255,255,255,0.08)",
                borderRadius: "6px",
                padding: "10px",
                color: "#fff",
                fontSize: "0.85rem",
                height: "60px",
                resize: "none"
              }}
            />
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
            <label style={{ fontSize: "0.75rem", color: "#94a3b8" }}>Category</label>
            <select
              value={category}
              onChange={e => setCategory(e.target.value)}
              style={{
                backgroundColor: "#0d0d0d",
                border: "1px solid rgba(255,255,255,0.08)",
                borderRadius: "6px",
                padding: "10px",
                color: "#fff",
                fontSize: "0.85rem"
              }}
            >
              {["Notes", "Assignment", "Circular", "Syllabus", "Question Paper", "Other"].map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
        </div>

        <hr style={{ border: 0, borderTop: "1px solid rgba(255,255,255,0.06)", margin: "4px 0" }} />

        {/* Target Audience Distribution */}
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          <div style={{ fontSize: "0.85rem", fontWeight: 600, color: "#cbd5e1" }}>2. Distribution Targets</div>

          <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
            <label style={{ fontSize: "0.75rem", color: "#94a3b8" }}>Target Year</label>
            <select
              value={targetYear}
              onChange={e => setTargetYear(e.target.value)}
              style={{
                backgroundColor: "#0d0d0d",
                border: "1px solid rgba(255,255,255,0.08)",
                borderRadius: "6px",
                padding: "10px",
                color: "#fff",
                fontSize: "0.85rem"
              }}
            >
              <option value="all">All Years (1st - 4th)</option>
              <option value="1">1st Year</option>
              <option value="2">2nd Year</option>
              <option value="3">3rd Year</option>
              <option value="4">4th Year</option>
            </select>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
            <label style={{ fontSize: "0.75rem", color: "#94a3b8" }}>Target Branch</label>
            <select
              value={targetBranch}
              onChange={e => setTargetBranch(e.target.value)}
              style={{
                backgroundColor: "#0d0d0d",
                border: "1px solid rgba(255,255,255,0.08)",
                borderRadius: "6px",
                padding: "10px",
                color: "#fff",
                fontSize: "0.85rem"
              }}
            >
              <option value="all">All Branches</option>
              <option value="CSE">CSE (Computer Science)</option>
              <option value="IT">IT (Information Technology)</option>
              <option value="ECE">ECE (Electronics & Comm)</option>
              <option value="ME">ME (Mechanical Eng)</option>
              <option value="CE">CE (Civil Eng)</option>
              <option value="EEE">EEE (Electrical Eng)</option>
            </select>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
            <label style={{ fontSize: "0.75rem", color: "#94a3b8" }}>Target Batch</label>
            <select
              value={targetBatch}
              onChange={e => setTargetBatch(e.target.value)}
              style={{
                backgroundColor: "#0d0d0d",
                border: "1px solid rgba(255,255,255,0.08)",
                borderRadius: "6px",
                padding: "10px",
                color: "#fff",
                fontSize: "0.85rem"
              }}
            >
              <option value="all">All Batches</option>
              <option value="A1">A1</option>
              <option value="A2">A2</option>
              <option value="B1">B1</option>
              <option value="B2">B2</option>
            </select>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 8 }}>
            <input 
              type="checkbox" 
              id="isPublicCheck"
              checked={isPublic} 
              onChange={e => setIsPublic(e.target.checked)}
              style={{ cursor: "pointer", width: 16, height: 16 }}
            />
            <label htmlFor="isPublicCheck" style={{ fontSize: "0.8rem", color: "#cbd5e1", cursor: "pointer" }}>
              Public (All Registered Students)
            </label>
          </div>
        </div>

        <hr style={{ border: 0, borderTop: "1px solid rgba(255,255,255,0.06)", margin: "4px 0" }} />

        {/* Watermark Section */}
        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <input 
              type="checkbox" 
              id="useWatermark"
              checked={useWatermark}
              onChange={e => setUseWatermark(e.target.checked)}
              style={{ cursor: "pointer", width: 16, height: 16 }}
            />
            <label htmlFor="useWatermark" style={{ fontSize: "0.85rem", fontWeight: 600, color: "#cbd5e1", cursor: "pointer" }}>
              3. Apply Watermark Overlay
            </label>
          </div>

          {useWatermark && (
            <input 
              type="text" 
              placeholder="Watermark text..." 
              value={watermarkText} 
              onChange={e => setWatermarkText(e.target.value)}
              style={{
                backgroundColor: "rgba(255,255,255,0.03)",
                border: "1px solid rgba(255,255,255,0.08)",
                borderRadius: "6px",
                padding: "8px 10px",
                color: "#fff",
                fontSize: "0.8rem"
              }}
            />
          )}
        </div>

        {/* Generate / Compile Button */}
        <div style={{ marginTop: "auto", display: "flex", flexDirection: "column", gap: 10 }}>
          {uploadProgress && (
            <div style={{ fontSize: "0.8rem", color: "#10b981", textAlign: "center", fontWeight: "500" }}>
              {uploadProgress}
            </div>
          )}
          <button
            onClick={compileAndUploadPdf}
            disabled={isGenerating || images.length === 0}
            style={{
              width: "100%",
              padding: "14px",
              backgroundColor: images.length === 0 ? "rgba(255,255,255,0.05)" : "#3b82f6",
              color: images.length === 0 ? "#64748b" : "#fff",
              border: "none",
              borderRadius: "8px",
              fontSize: "0.9rem",
              fontWeight: "bold",
              cursor: images.length === 0 ? "not-allowed" : "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
              transition: "background-color 0.2s"
            }}
          >
            <Share2 size={16} />
            {isGenerating ? "Compiling..." : "Compile & Distribute PDF"}
          </button>
        </div>
      </div>

      {/* Main Workspace Workspace */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", height: "100%" }}>
        {/* Workspace Topbar */}
        <div
          style={{
            height: "70px",
            borderBottom: "1px solid rgba(255,255,255,0.06)",
            padding: "0 24px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            backgroundColor: "rgba(255,255,255,0.005)"
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <span style={{ fontSize: "0.85rem", color: "#94a3b8" }}>
              Sequence list ({images.length} pages)
            </span>
          </div>

          <div style={{ display: "flex", gap: 12 }}>
            {/* Import Images Button */}
            <button
              onClick={() => fileInputRef.current?.click()}
              style={{
                padding: "8px 16px",
                backgroundColor: "rgba(255,255,255,0.06)",
                border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: "6px",
                fontSize: "0.85rem",
                color: "#cbd5e1",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: 6
              }}
            >
              <Plus size={14} /> Add Scans / Images
            </button>
            <input 
              type="file" 
              ref={fileInputRef} 
              multiple 
              accept="image/png, image/jpeg, image/webp" 
              onChange={handleFileSelect} 
              style={{ display: "none" }}
            />

            {/* Exit/Close Button */}
            <button
              onClick={onClose}
              style={{
                padding: "8px 12px",
                backgroundColor: "transparent",
                border: "none",
                color: "#94a3b8",
                cursor: "pointer"
              }}
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Thumbnail Sequence Grid */}
        <div style={{ flex: 1, padding: "24px", overflowY: "auto" }}>
          {images.length === 0 ? (
            <div
              onClick={() => fileInputRef.current?.click()}
              style={{
                height: "100%",
                border: "2px dashed rgba(255,255,255,0.08)",
                borderRadius: "14px",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                gap: 12,
                transition: "border-color 0.2s"
              }}
            >
              <ImageIcon size={48} style={{ color: "#475569" }} />
              <div style={{ fontWeight: "600", fontSize: "1rem", color: "#94a3b8" }}>
                Upload multiple scans or document images
              </div>
              <div style={{ fontSize: "0.8rem", color: "#64748b" }}>
                Click to browse files (JPEG, PNG, WEBP)
              </div>
            </div>
          ) : (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
                gap: "24px"
              }}
            >
              {images.map((img, idx) => (
                <div
                  key={img.id}
                  style={{
                    backgroundColor: "rgba(255,255,255,0.02)",
                    border: "1px solid rgba(255,255,255,0.06)",
                    borderRadius: "10px",
                    overflow: "hidden",
                    display: "flex",
                    flexDirection: "column",
                    position: "relative"
                  }}
                >
                  {/* Page Indicator Tag */}
                  <div
                    style={{
                      position: "absolute",
                      top: 10,
                      left: 10,
                      backgroundColor: "rgba(0,0,0,0.75)",
                      color: "#fff",
                      fontSize: "0.75rem",
                      padding: "4px 8px",
                      borderRadius: "4px",
                      fontWeight: "bold",
                      zIndex: 2
                    }}
                  >
                    Page {idx + 1}
                  </div>

                  {/* Image Viewport */}
                  <div
                    style={{
                      height: "220px",
                      backgroundColor: "#181818",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      padding: "10px",
                      position: "relative"
                    }}
                  >
                    <img 
                      src={img.processedUrl} 
                      alt={img.name} 
                      style={{
                        maxHeight: "100%",
                        maxWidth: "100%",
                        objectFit: "contain",
                        borderRadius: "4px",
                        boxShadow: "0 4px 10px rgba(0,0,0,0.5)"
                      }}
                    />
                  </div>

                  {/* Actions / Filter Panel */}
                  <div
                    style={{
                      padding: "12px",
                      borderTop: "1px solid rgba(255,255,255,0.06)",
                      display: "flex",
                      flexDirection: "column",
                      gap: 8
                    }}
                  >
                    {/* Filters Toolbar */}
                    <div style={{ display: "flex", gap: 6, justifyContent: "space-between" }}>
                      <button
                        title="Magic White CamScanner Filter"
                        onClick={() => applyMagicFilter(img, img.filter === "magic" ? "none" : "magic")}
                        style={{
                          flex: 1,
                          padding: "6px",
                          borderRadius: "4px",
                          border: "none",
                          cursor: "pointer",
                          fontSize: "0.75rem",
                          fontWeight: "500",
                          backgroundColor: img.filter === "magic" ? "#10b981" : "rgba(255,255,255,0.05)",
                          color: img.filter === "magic" ? "#000" : "#cbd5e1",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          gap: 4
                        }}
                      >
                        <Sparkles size={12} /> Magic
                      </button>

                      <button
                        title="Draw & Annotate"
                        onClick={() => setActiveImageId(img.id)}
                        style={{
                          flex: 1,
                          padding: "6px",
                          borderRadius: "4px",
                          border: "none",
                          cursor: "pointer",
                          fontSize: "0.75rem",
                          fontWeight: "500",
                          backgroundColor: "rgba(255,255,255,0.05)",
                          color: "#cbd5e1",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          gap: 4
                        }}
                      >
                        <Edit3 size={12} /> Draw
                      </button>
                    </div>

                    {/* Sequence navigation & delete */}
                    <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                      <button
                        onClick={() => moveImage(idx, "left")}
                        disabled={idx === 0}
                        style={{
                          padding: "6px",
                          backgroundColor: "rgba(255,255,255,0.03)",
                          border: "none",
                          borderRadius: "4px",
                          color: idx === 0 ? "#475569" : "#cbd5e1",
                          cursor: idx === 0 ? "not-allowed" : "pointer"
                        }}
                      >
                        <MoveLeft size={14} />
                      </button>

                      <button
                        onClick={() => moveImage(idx, "right")}
                        disabled={idx === images.length - 1}
                        style={{
                          padding: "6px",
                          backgroundColor: "rgba(255,255,255,0.03)",
                          border: "none",
                          borderRadius: "4px",
                          color: idx === images.length - 1 ? "#475569" : "#cbd5e1",
                          cursor: idx === images.length - 1 ? "not-allowed" : "pointer"
                        }}
                      >
                        <MoveRight size={14} />
                      </button>

                      <button
                        onClick={() => removeImage(img.id)}
                        style={{
                          padding: "6px",
                          backgroundColor: "rgba(239, 68, 68, 0.15)",
                          border: "none",
                          borderRadius: "4px",
                          color: "#ef4444",
                          cursor: "pointer",
                          marginLeft: "auto"
                        }}
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Drawing / Canvas Editor Modal */}
      {activeImage && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            backgroundColor: "#09090b",
            zIndex: 11000,
            display: "flex",
            flexDirection: "column"
          }}
        >
          {/* Editor Header */}
          <div
            style={{
              height: "60px",
              borderBottom: "1px solid rgba(255,255,255,0.08)",
              padding: "0 24px",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between"
            }}
          >
            <div style={{ fontSize: "0.9rem", fontWeight: "bold" }}>
              Editing: {activeImage.name}
            </div>

            {/* Editing Tools */}
            <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
              {/* Tool selector */}
              <div style={{ display: "flex", backgroundColor: "rgba(255,255,255,0.04)", padding: "4px", borderRadius: "6px", gap: 4 }}>
                <button
                  onClick={() => setCanvasTool("draw")}
                  style={{
                    padding: "6px 12px",
                    backgroundColor: canvasTool === "draw" ? "#3b82f6" : "transparent",
                    color: canvasTool === "draw" ? "#fff" : "#cbd5e1",
                    border: "none",
                    borderRadius: "4px",
                    cursor: "pointer",
                    fontSize: "0.8rem",
                    display: "flex",
                    alignItems: "center",
                    gap: 6
                  }}
                >
                  <Edit2 size={12} /> Draw
                </button>

                <button
                  onClick={() => setCanvasTool("text")}
                  style={{
                    padding: "6px 12px",
                    backgroundColor: canvasTool === "text" ? "#3b82f6" : "transparent",
                    color: canvasTool === "text" ? "#fff" : "#cbd5e1",
                    border: "none",
                    borderRadius: "4px",
                    cursor: "pointer",
                    fontSize: "0.8rem",
                    display: "flex",
                    alignItems: "center",
                    gap: 6
                  }}
                >
                  <Type size={12} /> Text
                </button>

                <button
                  onClick={() => setCanvasTool("erase")}
                  style={{
                    padding: "6px 12px",
                    backgroundColor: canvasTool === "erase" ? "#3b82f6" : "transparent",
                    color: canvasTool === "erase" ? "#fff" : "#cbd5e1",
                    border: "none",
                    borderRadius: "4px",
                    cursor: "pointer",
                    fontSize: "0.8rem",
                    display: "flex",
                    alignItems: "center",
                    gap: 6
                  }}
                >
                  <Eraser size={12} /> Erase
                </button>
              </div>

              {/* Color selector */}
              {canvasTool !== "erase" && (
                <div style={{ display: "flex", gap: 6 }}>
                  {["#ff0000", "#0000ff", "#000000", "#10b981", "#ffb800"].map(c => (
                    <button
                      key={c}
                      onClick={() => setBrushColor(c)}
                      style={{
                        width: 20,
                        height: 20,
                        borderRadius: "50%",
                        backgroundColor: c,
                        border: brushColor === c ? "2px solid #fff" : "1px solid rgba(255,255,255,0.2)",
                        cursor: "pointer"
                      }}
                    />
                  ))}
                </div>
              )}

              {/* Brush size */}
              {canvasTool !== "text" && (
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ fontSize: "0.75rem", color: "#94a3b8" }}>Size:</span>
                  <input 
                    type="range" 
                    min="2" 
                    max="30" 
                    value={brushWidth} 
                    onChange={e => setBrushWidth(parseInt(e.target.value))}
                    style={{ width: "80px", cursor: "pointer" }}
                  />
                </div>
              )}
            </div>

            {/* Actions */}
            <div style={{ display: "flex", gap: 12 }}>
              <button
                onClick={saveCanvasEdits}
                style={{
                  padding: "8px 16px",
                  backgroundColor: "#10b981",
                  color: "#000",
                  fontWeight: "bold",
                  border: "none",
                  borderRadius: "6px",
                  fontSize: "0.85rem",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: 6
                }}
              >
                <Check size={14} /> Done
              </button>
              <button
                onClick={() => setActiveImageId(null)}
                style={{
                  padding: "8px 16px",
                  backgroundColor: "rgba(255,255,255,0.06)",
                  border: "1px solid rgba(255,255,255,0.1)",
                  borderRadius: "6px",
                  color: "#cbd5e1",
                  fontSize: "0.85rem",
                  cursor: "pointer"
                }}
              >
                Cancel
              </button>
            </div>
          </div>

          {/* Editor Workspace Canvas */}
          <div
            style={{
              flex: 1,
              overflow: "auto",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: "40px",
              backgroundColor: "#020202",
              position: "relative"
            }}
          >
            {/* Canvas overlay for text placement prompt */}
            {textModeActive && (
              <div
                style={{
                  position: "absolute",
                  backgroundColor: "rgba(0,0,0,0.85)",
                  padding: "16px",
                  borderRadius: "8px",
                  border: "1px solid rgba(255,255,255,0.1)",
                  display: "flex",
                  gap: 10,
                  zIndex: 12000,
                  boxShadow: "0 10px 30px rgba(0,0,0,0.5)"
                }}
              >
                <input 
                  type="text" 
                  placeholder="Type annotation text..." 
                  value={textInput}
                  onChange={e => setTextInput(e.target.value)}
                  onKeyDown={e => { if (e.key === "Enter") applyTextToCanvas(); }}
                  autoFocus
                  style={{
                    backgroundColor: "#111",
                    border: "1px solid rgba(255,255,255,0.15)",
                    padding: "8px 12px",
                    borderRadius: "4px",
                    color: "#fff",
                    fontSize: "0.85rem"
                  }}
                />
                <button
                  onClick={applyTextToCanvas}
                  style={{
                    backgroundColor: "#3b82f6",
                    color: "#fff",
                    border: "none",
                    padding: "8px 14px",
                    borderRadius: "4px",
                    fontWeight: "bold",
                    fontSize: "0.85rem",
                    cursor: "pointer"
                  }}
                >
                  Place
                </button>
                <button
                  onClick={() => setTextModeActive(false)}
                  style={{
                    backgroundColor: "transparent",
                    color: "#94a3b8",
                    border: "none",
                    cursor: "pointer"
                  }}
                >
                  Cancel
                </button>
              </div>
            )}

            <canvas
              ref={canvasRef}
              onMouseDown={handleStartDraw}
              onMouseMove={handleDraw}
              onMouseUp={handleStopDraw}
              onMouseLeave={handleStopDraw}
              onTouchStart={handleStartDraw}
              onTouchMove={handleDraw}
              onTouchEnd={handleStopDraw}
              onClick={handleCanvasClick}
              style={{
                boxShadow: "0 10px 40px rgba(0,0,0,0.8)",
                borderRadius: "4px",
                cursor: canvasTool === "text" ? "text" : "crosshair",
                maxWidth: "100%",
                maxHeight: "100%",
                objectFit: "contain",
                backgroundColor: "#fff"
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
