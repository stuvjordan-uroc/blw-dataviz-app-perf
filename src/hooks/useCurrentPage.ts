import { useState } from "react";

export function useCurrentPage() {
  const [currentPage, setCurrentPage] = useState(0);
  function nextPage() {
    setCurrentPage(currentPage + 1);
  }
  function prevPage() {
    setCurrentPage(currentPage - 1);
  }
  return ({
    currentPage: currentPage,
    nextPage: nextPage,
    prevPage: prevPage
  })
}