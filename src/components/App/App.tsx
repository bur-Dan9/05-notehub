import css from "./App.module.css";

import SearchBox from "../SearchBox/SearchBox";
import Pagination from "../Pagination/Pagination";
import NoteList from "../NoteList/NoteList";
import Modal from "../Modal/Modal";
import NoteForm from "../NoteForm/NoteForm";

import { useState } from "react";
import { useDebounce } from "use-debounce";
import { useQuery } from "@tanstack/react-query";
import { fetchNotes } from "../../services/noteService";
import { Toaster } from "react-hot-toast";
import { keepPreviousData } from "@tanstack/react-query";

export default function App() {
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  const [debounceSearchQuery] = useDebounce(searchQuery, 300);

  const { data } = useQuery({
    queryKey: ["notes", debounceSearchQuery, currentPage],
    queryFn: () => fetchNotes(debounceSearchQuery, currentPage),
    placeholderData: keepPreviousData,
  });

  const notes = data?.notes ?? [];
  const totalPages = data?.totalPages ?? 0;

  const changeSearchQuery = (newQuery: string) => {
    setCurrentPage(1);
    setSearchQuery(newQuery);
  };

  const toogleModal = () => {
    setIsModalOpen(!isModalOpen);
  };

  return (
    <div className={css.app}>
      <Toaster position="top-right" reverseOrder={false} />
      <header className={css.toolbar}>
        <SearchBox value={searchQuery} onSearch={changeSearchQuery} />
        {totalPages > 1 && (
          <Pagination
            totalPages={totalPages}
            currentPage={currentPage}
            onPageChange={setCurrentPage}
          />
        )}
        <button
          className={css.button}
          onClick={() => {
            toogleModal();
          }}
        >
          Create Note +
        </button>
      </header>
      {isModalOpen && (
        <Modal onClose={toogleModal}>
          {isModalOpen && (
            <NoteForm
              onClose={() => {
                toogleModal();
              }}
            />
          )}
        </Modal>
      )}
      {notes.length > 0 && <NoteList notes={notes} />}
    </div>
  );
}