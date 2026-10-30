'use client'

import { useEffect, useState } from 'react'
import { supabase } from './supabase'

export default function Home() {
  const [books, setBooks] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('') // New state for search

  const fetchBooks = async () => {
    const { data, error } = await supabase.from('books').select('*').order('id')
    if (data) setBooks(data)
    setLoading(false)
  }

  useEffect(() => {
    fetchBooks()
  }, [])

  const handleBorrow = async (bookId: number) => {
    const studentName = prompt("Enter your full name:")
    const studentEmail = prompt("Enter your email:")

    if (!studentName || !studentEmail) {
      alert("You must provide a name and email to borrow a book.")
      return
    }

    const { error: bookError } = await supabase
      .from('books')
      .update({ status: 'Borrowed' })
      .eq('id', bookId)

    if (bookError) {
      alert("Error borrowing book: " + bookError.message)
      return
    }

    const { error: loanError } = await supabase
      .from('loans')
      .insert({
        book_id: bookId,
        student_name: studentName,
        student_email: studentEmail
      })

    if (loanError) {
      alert("Error recording loan: " + loanError.message)
      return
    }

    alert("Book borrowed successfully!")
    fetchBooks()
  }

  // Filter books based on the search input
  const filteredBooks = books.filter((book) => 
    book.title.toLowerCase().includes(search.toLowerCase()) || 
    book.author.toLowerCase().includes(search.toLowerCase())
  )

  if (loading) return <p className="p-8 text-center text-xl">Loading library...</p>

  return (
    <main className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-blue-600 mb-2">
          Departmental Library Portal
        </h1>
        <p className="text-gray-600 mb-8">
          Browse our collection of books below.
        </p>

        {/* Search Bar */}
        <div className="mb-6">
          <input 
            type="text" 
            placeholder="Search by title or author..." 
            className="w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredBooks.map((book) => (
            <div key={book.id} className="bg-white p-6 rounded-lg shadow-md border border-gray-100 flex flex-col justify-between">
              <div>
                <h2 className="text-xl font-semibold text-gray-800">{book.title}</h2>
                <p className="text-gray-600 mb-4">by {book.author}</p>
              </div>
              
              <div className="flex items-center justify-between mt-4">
                <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                  book.status === 'Available' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}>
                  {book.status}
                </span>

                {book.status === 'Available' && (
                  <button 
                    onClick={() => handleBorrow(book.id)}
                    className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors text-sm font-medium"
                  >
                    Borrow
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        {filteredBooks.length === 0 && (
          <p className="text-gray-500 italic mt-4 text-center">No books found matching your search.</p>
        )}
      </div>
    </main>
  )
}