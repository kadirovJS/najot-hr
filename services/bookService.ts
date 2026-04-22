export const bookService = {
  async getBooks(): Promise<any[]> {
    const res = await fetch('/api/books');
    return res.json();
  },

  async getBook(id: string): Promise<any> {
    const res = await fetch(`/api/books/${id}`);
    return res.json();
  },

  async createBook(data: any): Promise<any> {
    const res = await fetch('/api/books', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return res.json();
  },

  async updateBook(id: string, data: any): Promise<any> {
    const res = await fetch(`/api/books/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return res.json();
  },

  async deleteBook(id: string): Promise<any> {
    const res = await fetch(`/api/books/${id}`, { method: 'DELETE' });
    return res.json();
  },

  async addComment(bookId: string, text: string): Promise<any> {
    const res = await fetch(`/api/books/${bookId}/comments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text })
    });
    return res.json();
  },

  async updateComment(bookId: string, commentId: string, text: string): Promise<any> {
    const res = await fetch(`/api/books/${bookId}/comments/${commentId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text })
    });
    return res.json();
  },

  async deleteComment(bookId: string, commentId: string): Promise<any> {
    const res = await fetch(`/api/books/${bookId}/comments/${commentId}`, {
      method: 'DELETE'
    });
    return res.json();
  }
};
