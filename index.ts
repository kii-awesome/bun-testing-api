import { serve } from "bun";

interface Book {
    id: string;
    title: string;
    author: string
}

let Books: Book[] = [];

// get all books
function handleGetAllBooks() {
    return new Response(JSON.stringify(Books), {
        headers: { 'Content-Type': 'application/json' },
        status: 200,
    })
}

// get book
function handleGetBook(id: string) {
    const book = Books.find((book) => book.id == id);

    if (!book) {
        return new Response('Book not found!', {
            status: 404,
        })
    };

    return new Response(JSON.stringify(book), {
        headers: { 'Content-Type': 'application/json'},
        status: 200
    })
}

// create  book
function handleCreateBook(title: string, author: string) {
    const newBook: Book = {
        id: `${Books.length}`,
        title,
        author,
    }

    Books.push(newBook);

    return new Response(JSON.stringify(Books), {
        headers: { 'Content-Type': 'application/json' },
        status: 201
    })
}

// edit book
function handleEditBook(id: string, title: string, author: string) {
    const bookIndex = Books.findIndex((book) => book.id == id);

    if (bookIndex === -1) {
        return new Response('Book not found!', {
            status: 404
        })
    };

    Books[bookIndex] = {
        ...Books[bookIndex],
        title,
        author
    };

    return new Response('Book updated', {
        status: 200
    })
}

// delete
function handleDeleteBook(id: string) {
    const bookIndex = Books.findIndex((book) => book.id == id);
    
    if (bookIndex === -1) {
        return new Response('Book not found!', {
            status: 404
        })
    };

    Books.splice(bookIndex, 1);

    return new Response('Book '+ `${bookIndex}` + ' removed', {
        status: 200
    })
}

serve({
    port: 3000, // default port
    async fetch(req) {
        const { method } = req;
        const { pathname } = new URL(req.url);
        const pathRegex = /^\/api\/books\/([0-9]+)$/;

        if (method === 'GET' && pathname === '/api/books') {
            return handleGetAllBooks();
        };

        if (method === 'GET') {
            const bookId = pathname.match(pathRegex);
            const id = bookId && bookId[1];
            
            if(id) {
                return handleGetBook(id)
            }
        };

        if (method === 'POST' && pathname === '/api/books') {
            const newBook = await req.json();
            return handleCreateBook(newBook.title, newBook.author);
        }

        if (method === 'PATCH') {
            const bookId = pathname.match(pathRegex);
            const id = bookId && bookId[1];

            if (id) {
                const editBook = await req.json();
                return handleEditBook(id , editBook.title, editBook.author);
            }
        }

        if (method === 'DELETE') {
            const deleteBook = pathname.match(pathRegex);
            const id = deleteBook && deleteBook[1];
            if (id) {
                return handleDeleteBook(id)
            }
        }

        return new Response('Not founds!', {
            headers: {'Content-Type': 'application/json'},
            status: 404
        })
    }
})