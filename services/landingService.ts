export const landingService = {
  getSettings: async () => {
    const res = await fetch('/api/landing/settings', { cache: 'no-store' });
    if (!res.ok) throw new Error("Settings fetch failed");
    return res.json();
  },

  updateSettings: async (data: any) => {
    const res = await fetch('/api/landing/settings', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error("Settings update failed");
    return res.json();
  },

  getTeam: async () => {
    const res = await fetch('/api/landing/team', { cache: 'no-store' });
    if (!res.ok) throw new Error("Team fetch failed");
    return res.json();
  },

  createTeamMember: async (data: any) => {
    const res = await fetch('/api/landing/team', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error("Team member creation failed");
    return res.json();
  },

  updateTeamMember: async (id: string, data: any) => {
    const res = await fetch(`/api/landing/team/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error("Team member update failed");
    return res.json();
  },

  deleteTeamMember: async (id: string) => {
    const res = await fetch(`/api/landing/team/${id}`, {
      method: 'DELETE'
    });
    if (!res.ok) throw new Error("Team member deletion failed");
    return res.json();
  },

  // Partners API
  getPartners: async () => {
    const res = await fetch('/api/landing/partners', { cache: 'no-store' });
    if (!res.ok) throw new Error("Partners fetch failed");
    return res.json();
  },

  createPartner: async (data: any) => {
    const res = await fetch('/api/landing/partners', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error("Partner creation failed");
    return res.json();
  },

  updatePartner: async (id: string, data: any) => {
    const res = await fetch(`/api/landing/partners/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error("Partner update failed");
    return res.json();
  },

  deletePartner: async (id: string) => {
    const res = await fetch(`/api/landing/partners/${id}`, {
      method: 'DELETE'
    });
    if (!res.ok) throw new Error("Partner deletion failed");
    return res.json();
  },

  uploadImage: async (file: File): Promise<any> => {
    const folder = 'najot-hr-landing';
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
    
    if (!res.ok) throw new Error("Cloudinary upload failed");
    return res.json();
  }
};
