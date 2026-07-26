export const onboardingService = {
  async getVideos(): Promise<any[]> {
    const res = await fetch('/api/onboarding/videos');
    return res.json();
  },

  async uploadToCloudinary(file: File, onProgress: (p: number) => void): Promise<any> {
    const folder = 'najot-hr-onboarding';
    const signRes = await fetch(`/api/onboarding/videos/sign?folder=${folder}`);
    const signData = await signRes.json();
    
    // ... (keyingi qatorlar o'zgarmaydi, faqat folder parametrini qo'shib ketish kerak bo'ladi)
    // Lekin hozir hamma joyni bittada almashtiraman


    const chunkSize = 10 * 1024 * 1024; // 10MB lik bo'laklar
    const totalChunks = Math.ceil(file.size / chunkSize);
    const uniqueUploadId = 'upload_' + Date.now() + Math.random().toString(36).substring(7);

    let result: any = null;

    for (let i = 0; i < totalChunks; i++) {
      const start = i * chunkSize;
      const end = Math.min(start + chunkSize, file.size);
      const chunk = file.slice(start, end);

      const formData = new FormData();
      formData.append('file', chunk);
      formData.append('api_key', signData.apiKey);
      formData.append('timestamp', signData.timestamp);
      formData.append('signature', signData.signature);
      formData.append('folder', folder);

      const contentRange = `bytes ${start}-${end - 1}/${file.size}`;

      result = await new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open('POST', `https://api.cloudinary.com/v1_1/${signData.cloudName}/video/upload`);
        
        xhr.setRequestHeader('X-Unique-Upload-Id', uniqueUploadId);
        xhr.setRequestHeader('Content-Range', contentRange);

        xhr.upload.onprogress = (event) => {
          if (event.lengthComputable) {
            const chunkProgress = (event.loaded / event.total) * (100 / totalChunks);
            const overallProgress = Math.round((i * (100 / totalChunks)) + chunkProgress);
            onProgress(Math.min(overallProgress, 99));
          }
        };

        xhr.onload = () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            resolve(JSON.parse(xhr.responseText));
          } else {
            console.error("Cloudinary Chunk Error:", xhr.responseText);
            reject(new Error(`Chunk ${i} yuklashda xatolik`));
          }
        };

        xhr.onerror = () => reject(new Error('Network error'));
        xhr.send(formData);
      });
    }

    onProgress(100);
    return result;
  },

  async uploadImageToCloudinary(file: File, folder = 'najot-hr-books'): Promise<any> {
    const signRes = await fetch(`/api/onboarding/videos/sign?folder=${folder}`);
    const signData = await signRes.json();

    const formData = new FormData();
    formData.append('file', file);
    formData.append('api_key', signData.apiKey);
    formData.append('timestamp', signData.timestamp);
    formData.append('signature', signData.signature);
    formData.append('folder', folder);

    const res = await fetch(`https://api.cloudinary.com/v1_1/${signData.cloudName}/image/upload`, {
      method: 'POST',
      body: formData
    });
    const result = await res.json();
    if (!res.ok) throw new Error(result.error || 'Rasmni yuklab bo‘lmadi');
    return result;
  },

  async saveVideoData(data: any): Promise<any> {
    const res = await fetch('/api/onboarding/videos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return res.json();
  },

  async updateVideo(id: string, data: any): Promise<any> {
    const res = await fetch(`/api/onboarding/videos/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return res.json();
  },

  async deleteVideo(id: string): Promise<void> {
    await fetch(`/api/onboarding/videos/${id}`, { method: 'DELETE' });
  },

  async updateProgress(data: { videoId: string; action: 'heartbeat'; position: number; ended?: boolean }): Promise<any> {
    const res = await fetch('/api/onboarding/progress', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    const result = await res.json();
    if (!res.ok) throw new Error(result.error || 'Progress saqlanmadi');
    return result;
  },

  async submitTest(videoId: string, answers: number[]): Promise<any> {
    const res = await fetch('/api/onboarding/progress', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ videoId, action: 'submit-test', answers })
    });
    const result = await res.json();
    if (!res.ok) throw new Error(result.error || 'Test natijasini saqlab bo‘lmadi');
    return result;
  },

  async getMyProgress(): Promise<any[]> {
    const res = await fetch('/api/onboarding/progress');
    return res.json();
  }
};
