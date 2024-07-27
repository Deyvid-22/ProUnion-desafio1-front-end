import { useState, useEffect, useRef } from "react";
import { FormEvent } from "react";

import Image from 'next/image'; 
import { api } from "@/service/api";

import { FiTrash } from "react-icons/fi";
import { MdOutlineSend, MdModeEdit} from "react-icons/md";

import { format } from 'date-fns';

import { toast } from "react-toastify";
import { MessageError } from "@/components/MessageError";

interface TaskProps {
  id: string;
  title: string;
  createdAt: string;
}

export default function App() {
  const [isFlex, setIsFlex] = useState<boolean>(false); //ele controla a exibiciaçao da tarefa
  const [tasks, setTasks] = useState<TaskProps[]>([]); //armazena a lista de tarefas
  const [editTaskId, setEditTaskId] = useState<string | null>(null); //altera o estado da tarefa do id

  const titleRef = useRef<HTMLInputElement | null>(null); //referencia do input

  useEffect(() => {
    loadTasks();
  }, []);

  async function loadTasks() { //faz uma requisição GET para buscar as tarefas
    try {
      const response = await api.get("/tasks");
      setTasks(response.data);
    } catch (error) {
      console.error("Erro ao buscar dados:", error);
    }
  }

  async function handleAdd(event: FormEvent) { //envia o título da nova tarefa para a api
    event.preventDefault();

    if(!titleRef.current?.value) {
       toast.error("Preencha o campo tarefa")
      return
    }

    try {
      const response = await api.post(`/tasks`, {
        title: titleRef.current?.value,
      });

      setTasks((allTasks) => [...allTasks, response.data]);
    } catch (error) {
      console.error("Erro ao adicionar tarefa:", error);
    }

    if (titleRef.current) titleRef.current.value = "";
  }

  async function handleDelete(id: string) { //deleta uma tarefa com base id
    try {
      await api.delete(`/tasks/${id}`, {
        params: {
          id: id,
        },
      });

      const updatedTasks = tasks.filter((task) => task.id !== id);
      setTasks(updatedTasks);
    } catch (error) {
      console.error("Erro ao deletar tarefa:", error);
    }
  }

  function toggleEdit(id: string) {
    setEditTaskId(id);
    setIsFlex(true);
  }

  function cancelEdit() {
    setEditTaskId(null);
    setIsFlex(false);
  }

  async function handleUpdate(id: string) { //atualiza o titulo da tarefa com base no id
   
    if(!titleRef.current?.value){
        toast.error("Preencha o campo")
        return
    }
   
    try {
      await api.put(`/tasks/${id}`, {
        title: titleRef.current?.value,
      });

      const updatedTasks = tasks.map((task) =>
        task.id === id ? { ...task, title: titleRef.current?.value || task.title } : task
      );

      setTasks(updatedTasks);
      cancelEdit();
      window.location.reload();
    } catch (error) {
      console.error("Erro ao atualizar tarefa:", error);
    }
  }

  const formatDate = (createdAt: string): string => {
    // Função para formatar a data usando date-fns
    const date = new Date(createdAt);
    return format(date, 'dd/MM/yyyy HH:mm:ss');
  };

  return (
    <div className=" bg-gray-900">
      <Image src="/img/img.svg" alt="Descrição da imagem" width={400} height={500} className="m-auto" />

      <div className="w-full  min-h-screen bg-gray-900 flex  justify-center px-4">
        <main className="w-full md:max-w-2xl">
          <h1 className="text-3xl font-medium text-white">
          </h1>

          <form className="flex flex-col my-6" onSubmit={handleAdd}>
            <label className="font-medium text-white">Tarefa:</label>
            <input
              type="text"
              placeholder="Digite o título da tarefa"
              className="w-full mb-5 py-1 rounded"
              ref={titleRef}
            />

            <input
              type="submit"
              value="Adicionar"
              className="cursor-pointer w-full bg-green-500 p-2 rounded text-white"
            />
          </form>

          <section className="flex flex-col">
            {tasks.map((task) => (
              <article className="w-full bg-white rounded p-2 relative hover:scale-105 duration-100 mt-3" key={task.id}>
                <p>Tarefa: <span>{task.title}</span></p>
                <p>data <span>{formatDate(task.createdAt)}</span></p>

                <button
                  className="bg-red-500 w-9 h-9 flex justify-center items-center rounded-lg absolute top-[3px] right-[10px]"
                  onClick={() => handleDelete(task.id)}
                >
                  <FiTrash size={30} color="#fff" />
                </button>

                <button
                  className="bg-gray-300 w-9 h-9 flex justify-center items-center rounded-lg absolute top-[3px] right-[70px]"
                  onClick={() => toggleEdit(task.id)}
                >
                  <MdModeEdit />
                </button>

                {editTaskId === task.id && (
                  <div className={`w-[100%] mt-5 ${isFlex ? 'flex' : 'hidden'} justify-center gap-3 items-center`}>
                    <input
                      className="w-[90%] h-10 p-2 outline-none border rounded-2xl border-blue-950"
                      type="text"
                      defaultValue={task.title}
                      ref={titleRef}
                    />
                    <button
                      onClick={() => handleUpdate(task.id)}
                    >
                      <MdOutlineSend size={30} />
                    </button>
                    <button
                    className="bg-red-600  text-sm rounded-2xl p-2 text-white"
                      onClick={cancelEdit}
                    >
                      Cancelar
                    </button>
                  </div>
                )}
              </article>
            ))}
          </section>
        </main>

      </div>
      <MessageError/>
    </div>
  );
}
