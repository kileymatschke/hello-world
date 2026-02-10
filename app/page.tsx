import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export default async function Home() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (user) redirect("/gallery");
    redirect("/login");
}


// 'use client'
//
// import { useState, useEffect, useMemo } from 'react'
// import { createClient } from '@/lib/supabase/client' // Use the client component version
// import { useRouter } from 'next/navigation'
//
// export default function Home() {
//     const [user, setUser] = useState<any>(null)
//     const [session, setSession] = useState<any>(null)
//     const [displayItems, setDisplayItems] = useState<
//         Array<{ imageUrl: string; caption?: string; id: string | number }>
//     >([])
//     const [loading, setLoading] = useState(true)
//     const [error, setError] = useState<string | null>(null)
//     const [currentPage, setCurrentPage] = useState(1)
//     const [selectedItem, setSelectedItem] = useState<typeof displayItems[0] | null>(null)
//
//     const itemsPerPage = 100
//
//     const supabase = useMemo(() => createClient(), [])
//     const router = useRouter()
//
//     useEffect(() => {
//         const fetchSession = async () => {
//             const { data: { session } } = await supabase.auth.getSession()
//             setSession(session)
//             if (session) {
//                 const { data: { user } } = await supabase.auth.getUser()
//                 setUser(user)
//             }
//             setLoading(false)
//         }
//
//         fetchSession()
//
//         const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
//             setSession(session)
//             if (session) {
//                 setUser(session.user)
//             } else {
//                 setUser(null)
//             }
//         })
//
//         return () => subscription.unsubscribe()
//     }, [supabase])
//
//     const handleSignOut = async () => {
//         await supabase.auth.signOut()
//         router.push('/login')
//     }
//
//     // Fetch images and their associated captions (existing logic)
//     useEffect(() => {
//         if (!supabase || !session) { // Only fetch if session exists
//             setLoading(false)
//             return
//         }
//         const client = supabase;
//
//
//         async function fetchData() {
//             setLoading(true)
//             setError(null)
//             const FETCH_LIMIT = 1000 // Supabase default limit
//
//             const fetchAllFromTable = async (tableName: string, selectColumns: string) => {
//                 let allData: any[] = []
//                 let offset = 0
//                 let hasMore = true
//
//                 while (hasMore) {
//                     const { data, error } = await client
//                         .from(tableName)
//                         .select(selectColumns)
//                         .range(offset, offset + FETCH_LIMIT - 1) // range is inclusive
//
//                     if (error) throw error
//
//                     if (data && data.length > 0) {
//                         allData = allData.concat(data)
//                         offset += data.length
//                         if (data.length < FETCH_LIMIT) {
//                             hasMore = false
//                         }
//                     } else {
//                         hasMore = false
//                     }
//                 }
//
//                 return allData
//             }
//
//             try {
//                 const imagesData = await fetchAllFromTable('images', 'id, url')
//                 const captionsData = await fetchAllFromTable('captions', 'content, image_id')
//
//                 const imageObjects: Map<number, { id: number; imageUrl: string; captions: string[] }> = new Map()
//
//                 // Initialize image objects
//                 imagesData.forEach((image) => {
//                     imageObjects.set(image.id, {
//                         id: image.id,
//                         imageUrl: image.url,
//                         captions: [],
//                     })
//                 })
//
//                 // Add captions to their respective images
//                 captionsData.forEach((caption) => {
//                     if (caption.image_id && imageObjects.has(caption.image_id)) {
//                         imageObjects.get(caption.image_id)?.captions.push(caption.content)
//                     }
//                 })
//
//                 const itemsToDisplay: Array<{ imageUrl: string; caption?: string; id: string | number }> = []
//
//                 imageObjects.forEach((image) => {
//                     if (image.captions.length > 0) {
//                         image.captions.forEach((captionText, index) => {
//                             itemsToDisplay.push({
//                                 id: `${image.id}-${index}`, // Unique ID for each image-caption pair
//                                 imageUrl: image.imageUrl,
//                                 caption: captionText,
//                             })
//                         })
//                     } else {
//                         // If no captions, display the image once without a caption
//                         itemsToDisplay.push({
//                             id: image.id,
//                             imageUrl: image.imageUrl,
//                         })
//                     }
//                 })
//
//                 // Sort by number of captions associated with the original image in descending order
//                 const sortedDisplayItems = itemsToDisplay.sort((a, b) => {
//                     const originalImageIdA = typeof a.id === 'string' ? parseInt(a.id.split('-')[0]) : a.id
//                     const originalImageIdB = typeof b.id === 'string' ? parseInt(b.id.split('-')[0]) : b.id
//
//                     const captionsLengthA = imageObjects.get(originalImageIdA)?.captions.length || 0
//                     const captionsLengthB = imageObjects.get(originalImageIdB)?.captions.length || 0
//
//                     return captionsLengthB - captionsLengthA
//                 })
//
//                 // Randomize the order of display items (Fisher-Yates shuffle)
//                 for (let i = sortedDisplayItems.length - 1; i > 0; i--) {
//                     const j = Math.floor(Math.random() * (i + 1))
//                     ;[sortedDisplayItems[i], sortedDisplayItems[j]] = [sortedDisplayItems[j], sortedDisplayItems[i]]
//                 }
//
//                 setDisplayItems(sortedDisplayItems)
//             } catch (err: any) {
//                 console.error('Error fetching data:', err?.message ?? err)
//                 setError('Failed to load images and captions.')
//             } finally {
//                 setLoading(false)
//             }
//         }
//
//         // Only fetch data if session exists
//         if (session) {
//             void fetchData();
//         }
//     }, [supabase, session]) // Rerun effect when session changes
//
//     // Effect to handle Escape key for modal dismissal
//     useEffect(() => {
//         const handleEscape = (event: KeyboardEvent) => {
//             if (event.key === 'Escape') {
//                 setSelectedItem(null)
//             }
//         }
//
//         if (selectedItem) {
//             document.addEventListener('keydown', handleEscape)
//         }
//
//         return () => {
//             document.removeEventListener('keydown', handleEscape)
//         }
//     }, [selectedItem])
//
//     // Pagination logic
//     const indexOfLastItem = currentPage * itemsPerPage
//     const indexOfFirstItem = indexOfLastItem - itemsPerPage
//     const currentItems = displayItems.slice(indexOfFirstItem, indexOfLastItem)
//
//     const totalPages = Math.ceil(displayItems.length / itemsPerPage)
//
//     const handlePageChange = (pageNumber: number) => {
//         setCurrentPage(pageNumber)
//         window.scrollTo({ top: 0, behavior: 'smooth' })
//     }
//
//     return (
//         <main className="min-h-screen flex flex-col items-center justify-center text-center p-4">
//             <h1 className="text-4xl font-bold mb-8">The Humor Project</h1>
//
//             {loading && <p>Loading user session...</p>}
//
//             {session && user ? (
//                 <>
//                     <div style={{ marginBottom: '20px' }}>
//                         <p>Welcome, {user.email}!</p>
//                         <button
//                             onClick={handleSignOut}
//                             style={{
//                                 padding: '8px 15px',
//                                 fontSize: '14px',
//                                 cursor: 'pointer',
//                                 backgroundColor: '#dc3545',
//                                 color: 'white',
//                                 border: 'none',
//                                 borderRadius: '5px',
//                                 marginTop: '10px',
//                             }}
//                         >
//                             Sign Out
//                         </button>
//                     </div>
//
//                     {/* Gated Content */}
//                     <section className="w-full max-w-4xl">
//                         {loading && <p>Loading images and captions...</p>}
//                         {error && <p className="text-red-500">{error}</p>}
//
//                         <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
//                             {currentItems.map((item) => (
//                                 <div
//                                     key={item.id}
//                                     className="relative w-full overflow-hidden rounded-md shadow-lg bg-white p-2 flex flex-col justify-between cursor-pointer"
//                                     onClick={() => setSelectedItem(item)}
//                                 >
//                                     <img src={item.imageUrl} alt="Gallery item" className="object-cover w-full h-64 rounded-md mb-2" />
//                                     {item.caption && (
//                                         <div className="mt-2 text-sm text-gray-700">
//                                             <p className="mb-1 last:mb-0">{item.caption}</p>
//                                         </div>
//                                     )}
//                                 </div>
//                             ))}
//                         </div>
//
//                         {/* Pagination Controls */}
//                         {totalPages > 1 && (
//                             <div className="flex justify-center items-center mt-8 space-x-2">
//                                 <button
//                                     onClick={() => handlePageChange(currentPage - 1)}
//                                     disabled={currentPage === 1}
//                                     className="px-4 py-2 bg-gray-300 rounded-md hover:bg-gray-400 disabled:opacity-50"
//                                 >
//                                     Previous
//                                 </button>
//
//                                 {(() => {
//                                     const pageNumbers = []
//                                     const MAX_PAGE_BUTTONS = 5
//
//                                     let startPage = Math.max(1, currentPage - Math.floor(MAX_PAGE_BUTTONS / 2))
//                                     let endPage = Math.min(totalPages, startPage + MAX_PAGE_BUTTONS - 1)
//
//                                     if (endPage - startPage + 1 < MAX_PAGE_BUTTONS) {
//                                         startPage = Math.max(1, totalPages - MAX_PAGE_BUTTONS + 1)
//                                     }
//
//                                     if (startPage > 1) {
//                                         pageNumbers.push(
//                                             <button
//                                                 key="1"
//                                                 onClick={() => handlePageChange(1)}
//                                                 className={`px-4 py-2 rounded-md ${
//                                                     currentPage === 1 ? 'bg-blue-500 text-white' : 'bg-gray-200 hover:bg-gray-300'
//                                                 }`}
//                                             >
//                                                 1
//                                             </button>
//                                         )
//                                         if (startPage > 2) {
//                                             pageNumbers.push(
//                                                 <span key="ellipsis-start" className="px-2 py-2">
//                                                   ...
//                                                 </span>
//                                             )
//                                         }
//                                     }
//
//                                     for (let i = startPage; i <= endPage; i++) {
//                                         pageNumbers.push(
//                                             <button
//                                                 key={i}
//                                                 onClick={() => handlePageChange(i)}
//                                                 className={`px-4 py-2 rounded-md ${
//                                                     currentPage === i ? 'bg-blue-500 text-white' : 'bg-gray-200 hover:bg-gray-300'
//                                                 }`}
//                                             >
//                                                 {i}
//                                             </button>
//                                         )
//                                     }
//
//                                     if (endPage < totalPages) {
//                                         if (endPage < totalPages - 1) {
//                                             pageNumbers.push(
//                                                 <span key="ellipsis-end" className="px-2 py-2">
//                                                   ...
//                                                 </span>
//                                             )
//                                         }
//                                         pageNumbers.push(
//                                             <button
//                                                 key={totalPages}
//                                                 onClick={() => handlePageChange(totalPages)}
//                                                 className={`px-4 py-2 rounded-md ${
//                                                     currentPage === totalPages ? 'bg-blue-500 text-white' : 'bg-gray-200 hover:bg-gray-300'
//                                                 }`}
//                                             >
//                                                 {totalPages}
//                                             </button>
//                                         )
//                                     }
//
//                                     return pageNumbers
//                                 })()}
//
//                                 <button
//                                     onClick={() => handlePageChange(currentPage + 1)}
//                                     disabled={currentPage === totalPages}
//                                     className="px-4 py-2 bg-gray-300 rounded-md hover:bg-gray-400 disabled:opacity-50"
//                                 >
//                                     Next
//                                 </button>
//                             </div>
//                         )}
//                     </section>
//
//                     {/* Enlarged Image Modal */}
//                     {selectedItem && (
//                         <div
//                             className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4"
//                             onClick={() => setSelectedItem(null)}
//                         >
//                             <div
//                                 className="relative p-4 bg-white rounded-lg shadow-xl max-w-3xl max-h-[90vh] overflow-auto"
//                                 onClick={(e) => e.stopPropagation()}
//                             >
//                                 <button
//                                     className="absolute top-2 right-2 text-gray-700 hover:text-gray-900 text-2xl"
//                                     onClick={() => setSelectedItem(null)}
//                                 >
//                                     &times;
//                                 </button>
//                                 <img
//                                     src={selectedItem.imageUrl}
//                                     alt="Enlarged gallery item"
//                                     className="w-full h-auto object-contain rounded-md mb-4"
//                                 />
//                                 {selectedItem.caption && <p className="text-lg text-gray-800">{selectedItem.caption}</p>}
//                             </div>
//                         </div>
//                     )}
//                 </>
//             ) : (
//                 !loading && <p>Please sign in to view the content.</p>
//             )}
//         </main>
//     )
// }
//
//
//
// // "use client";
// //
// // import { useState, useEffect } from 'react';
// // import { getSupabaseClient } from '@/lib/supabase';
// //
// //
// //
// //
// // export default function Home() {
// //     const [pageCaption, setPageCaption] = useState<string | null>(null);
// //     const [displayItems, setDisplayItems] = useState<Array<{ imageUrl: string; caption?: string; id: string | number }>>([]);
// //     const [loading, setLoading] = useState(true);
// //     const [error, setError] = useState<string | null>(null);
// //     const [currentPage, setCurrentPage] = useState(1);
// //     const [selectedItem, setSelectedItem] = useState<typeof displayItems[0] | null>(null);
// //     const itemsPerPage = 100;
// //
// //     const supabase = getSupabaseClient();
// //
// //
// //
// //
// //     // Fetch images and their associated captions
// //     useEffect(() => {
// //         if (!supabase) {
// //             setError('Supabase is not configured.');
// //             setLoading(false);
// //             return;
// //         }
// //         async function fetchData() {
// //             setLoading(true);
// //             setError(null);
// //             const FETCH_LIMIT = 1000; // Supabase default limit
// //
// //             const fetchAllFromTable = async (tableName: string, selectColumns: string) => {
// //                 let allData: any[] = [];
// //                 let offset = 0;
// //                 let hasMore = true;
// //
// //                 while (hasMore) {
// //                     const { data, error } = await supabase
// //                         .from(tableName)
// //                         .select(selectColumns)
// //                         .range(offset, offset + FETCH_LIMIT - 1); // range is inclusive
// //
// //                     if (error) throw error;
// //
// //                     if (data && data.length > 0) {
// //                         allData = allData.concat(data);
// //                         offset += data.length;
// //                         if (data.length < FETCH_LIMIT) { // If fewer than limit returned, no more data
// //                             hasMore = false;
// //                         }
// //                     } else {
// //                         hasMore = false; // No data returned, so no more
// //                     }
// //                 }
// //                 return allData;
// //             };
// //
// //             try {
// //                 const imagesData = await fetchAllFromTable('images', 'id, url');
// //                 const captionsData = await fetchAllFromTable('captions', 'content, image_id');
// //
// //                 const imageObjects: Map<number, { id: number; imageUrl: string; captions: string[] }> = new Map();
// //
// //                 // Initialize image objects
// //                 imagesData.forEach(image => {
// //                     imageObjects.set(image.id, {
// //                         id: image.id,
// //                         imageUrl: image.url,
// //                         captions: [],
// //                     });
// //                 });
// //
// //                 // Add captions to their respective images
// //                 captionsData.forEach(caption => {
// //                     if (caption.image_id && imageObjects.has(caption.image_id)) {
// //                         imageObjects.get(caption.image_id)?.captions.push(caption.content);
// //                     }
// //                 });
// //
// //                 const itemsToDisplay: Array<{ imageUrl: string; caption?: string; id: string | number }> = [];
// //
// //                 imageObjects.forEach(image => {
// //                     if (image.captions.length > 0) {
// //                         image.captions.forEach((captionText, index) => {
// //                             itemsToDisplay.push({
// //                                 id: `${image.id}-${index}`, // Unique ID for each image-caption pair
// //                                 imageUrl: image.imageUrl,
// //                                 caption: captionText,
// //                             });
// //                         });
// //                     } else {
// //                         // If no captions, display the image once without a caption
// //                         itemsToDisplay.push({
// //                             id: image.id,
// //                             imageUrl: image.imageUrl,
// //                         });
// //                     }
// //                 });
// //
// //                 // Sort by number of captions associated with the original image in descending order
// //                 // This means images that had more captions will still appear first
// //                 const sortedDisplayItems = itemsToDisplay.sort((a, b) => {
// //                     const originalImageIdA = typeof a.id === 'string' ? parseInt(a.id.split('-')[0]) : a.id;
// //                     const originalImageIdB = typeof b.id === 'string' ? parseInt(b.id.split('-')[0]) : b.id;
// //
// //                     const captionsLengthA = imageObjects.get(originalImageIdA)?.captions.length || 0;
// //                     const captionsLengthB = imageObjects.get(originalImageIdB)?.captions.length || 0;
// //
// //                     return captionsLengthB - captionsLengthA;
// //                 });
// //
// //                 // Randomize the order of display items (Fisher-Yates shuffle)
// //                 for (let i = sortedDisplayItems.length - 1; i > 0; i--) {
// //                     const j = Math.floor(Math.random() * (i + 1));
// //                     [sortedDisplayItems[i], sortedDisplayItems[j]] = [sortedDisplayItems[j], sortedDisplayItems[i]];
// //                 }
// //
// //                 setDisplayItems(sortedDisplayItems);
// //
// //             } catch (err: any) {
// //                 console.error('Error fetching data:', err.message);
// //                 setError('Failed to load images and captions.');
// //             } finally {
// //                 setLoading(false);
// //             }
// //         }
// //         fetchData();
// //     }, []);
// //
// //     // Effect to handle Escape key for modal dismissal
// //     useEffect(() => {
// //         const handleEscape = (event: KeyboardEvent) => {
// //             if (event.key === 'Escape') {
// //                 setSelectedItem(null);
// //             }
// //         };
// //
// //         if (selectedItem) {
// //             document.addEventListener('keydown', handleEscape);
// //         } else {
// //             document.removeEventListener('keydown', handleEscape);
// //         }
// //
// //         return () => {
// //             document.removeEventListener('keydown', handleEscape);
// //         };
// //     }, [selectedItem]);
// //
// //     // Pagination logic
// //     const indexOfLastItem = currentPage * itemsPerPage;
// //     const indexOfFirstItem = indexOfLastItem - itemsPerPage;
// //     const currentItems = displayItems.slice(indexOfFirstItem, indexOfLastItem);
// //
// //     const totalPages = Math.ceil(displayItems.length / itemsPerPage);
// //
// //     const handlePageChange = (pageNumber: number) => {
// //         setCurrentPage(pageNumber);
// //         // Scroll to top of the grid when page changes
// //         window.scrollTo({ top: 0, behavior: 'smooth' });
// //     };
// //
// //     return (
// //         <main className="min-h-screen flex flex-col items-center justify-center text-center p-4">
// //             <h1 className="text-4xl font-bold mb-8">The Humor Project</h1>
// //             {pageCaption && <h2 className="text-2xl font-semibold mb-6 text-gray-700">{pageCaption}</h2>}
// //
// //             <section className="w-full max-w-4xl">
// //                 {loading && <p>Loading images and captions...</p>}
// //                 {error && <p className="text-red-500">{error}</p>}
// //
// //                 <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
// //                     {currentItems.map((item) => (
// //                         <div key={item.id} className="relative w-full overflow-hidden rounded-md shadow-lg bg-white p-2 flex flex-col justify-between cursor-pointer"
// //                              onClick={() => setSelectedItem(item)}>
// //                             <img
// //                                 src={item.imageUrl}
// //                                 alt="Gallery item"
// //                                 className="object-cover w-full h-64 rounded-md mb-2"
// //                             />
// //                             {item.caption && (
// //                                 <div className="mt-2 text-sm text-gray-700">
// //                                     <p className="mb-1 last:mb-0">{item.caption}</p>
// //                                 </div>
// //                             )}
// //                         </div>
// //                     ))}
// //                 </div>
// //
// //                 {/* Pagination Controls */}
// //                 {totalPages > 1 && (
// //                     <div className="flex justify-center items-center mt-8 space-x-2">
// //                         <button
// //                             onClick={() => handlePageChange(currentPage - 1)}
// //                             disabled={currentPage === 1}
// //                             className="px-4 py-2 bg-gray-300 rounded-md hover:bg-gray-400 disabled:opacity-50"
// //                         >
// //                             Previous
// //                         </button>
// //                         {(() => {
// //                             const pageNumbers = [];
// //                             const MAX_PAGE_BUTTONS = 5; // Max number of page buttons to display
// //
// //                             let startPage = Math.max(1, currentPage - Math.floor(MAX_PAGE_BUTTONS / 2));
// //                             let endPage = Math.min(totalPages, startPage + MAX_PAGE_BUTTONS - 1);
// //
// //                             // Adjust startPage if not enough buttons are shown at the end
// //                             if (endPage - startPage + 1 < MAX_PAGE_BUTTONS) {
// //                                 startPage = Math.max(1, totalPages - MAX_PAGE_BUTTONS + 1);
// //                             }
// //
// //                             // Render first page button and ellipsis if needed
// //                             if (startPage > 1) {
// //                                 pageNumbers.push(
// //                                     <button key="1" onClick={() => handlePageChange(1)} className={`px-4 py-2 rounded-md ${
// //                                         currentPage === 1 ? 'bg-blue-500 text-white' : 'bg-gray-200 hover:bg-gray-300'
// //                                     }`}>
// //                                         1
// //                                     </button>
// //                                 );
// //                                 if (startPage > 2) {
// //                                     pageNumbers.push(<span key="ellipsis-start" className="px-2 py-2">...</span>);
// //                                 }
// //                             }
// //
// //                             // Render dynamic range of page buttons
// //                             for (let i = startPage; i <= endPage; i++) {
// //                                 pageNumbers.push(
// //                                     <button
// //                                         key={i}
// //                                         onClick={() => handlePageChange(i)}
// //                                         className={`px-4 py-2 rounded-md ${
// //                                             currentPage === i ? 'bg-blue-500 text-white' : 'bg-gray-200 hover:bg-gray-300'
// //                                         }`}
// //                                     >
// //                                         {i}
// //                                     </button>
// //                                 );
// //                             }
// //
// //                             // Render ellipsis and last page button if needed
// //                             if (endPage < totalPages) {
// //                                 if (endPage < totalPages - 1) { // Only show ellipsis if there's a gap
// //                                     pageNumbers.push(<span key="ellipsis-end" className="px-2 py-2">...</span>);
// //                                 }
// //                                 pageNumbers.push(
// //                                     <button key={totalPages} onClick={() => handlePageChange(totalPages)} className={`px-4 py-2 rounded-md ${
// //                                         currentPage === totalPages ? 'bg-blue-500 text-white' : 'bg-gray-200 hover:bg-gray-300'
// //                                     }`}>
// //                                         {totalPages}
// //                                     </button>
// //                                 );
// //                             }
// //                             return pageNumbers;
// //                         })()}
// //                         <button
// //                             onClick={() => handlePageChange(currentPage + 1)}
// //                             disabled={currentPage === totalPages}
// //                             className="px-4 py-2 bg-gray-300 rounded-md hover:bg-gray-400 disabled:opacity-50"
// //                         >
// //                             Next
// //                         </button>
// //                     </div>
// //                 )}
// //             </section>
// //             {/* Enlarged Image Modal */}
// //             {selectedItem && (
// //                 <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4"
// //                      onClick={() => setSelectedItem(null)}>
// //                     <div className="relative p-4 bg-white rounded-lg shadow-xl max-w-3xl max-h-[90vh] overflow-auto"
// //                          onClick={(e) => e.stopPropagation()}> {/* Prevent click from closing modal */}
// //                         <button
// //                             className="absolute top-2 right-2 text-gray-700 hover:text-gray-900 text-2xl"
// //                             onClick={() => setSelectedItem(null)}
// //                         >
// //                             &times;
// //                         </button>
// //                         <img
// //                             src={selectedItem.imageUrl}
// //                             alt="Enlarged gallery item"
// //                             className="w-full h-auto object-contain rounded-md mb-4"
// //                         />
// //                         {selectedItem.caption && (
// //                             <p className="text-lg text-gray-800">{selectedItem.caption}</p>
// //                         )}
// //                     </div>
// //                 </div>
// //             )}
// //         </main>
// //     );
// // }
// //
// //
