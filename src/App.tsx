import { useState } from 'react';
import { useForm } from 'react-hook-form';

import './styles/global.css';

/** TO-DO
 * [ ] Validação / transformação
 * [ ] Field arrays
 * [ ] Upload de arquivos
 * [ ] Coomposition Pattern
 */

export default function App() {
  const [output, setOutput] = useState('');
  const { register, handleSubmit } = useForm();

  function createUser(data: any) {
    setOutput(JSON.stringify(data, null, 2));
  }

  return (
    <main className='h-screen bg-zinc-900 text-zinc-300 flex flex-col justify-center items-center gap-10'>
      <form
        className='flex flex-col gap-4 w-full max-w-sm'
        onSubmit={handleSubmit(createUser)}
      >
        <div className='flex flex-col gap-1'>
          <label htmlFor='email'>
            E-mail
          </label>

          <input
            className='border border-zinc-200 shadow-sm rounded h-10 px-3 bg-zinc-800 text-white'
            type='email'
            {...register('email')}
          />
        </div>

        <div className='flex flex-col gap-1'>
          <label htmlFor='senha'>
            Senha
          </label>

          <input
            className='border border-zinc-200 shadow-sm rounded h-10 px-3 bg-zinc-800 text-white'
            type='password'
            {...register('password')}
          />
        </div>

        <button
          type='submit'
          className='h-10 bg-emerald-500 rounded font-semibold text-white hover:bg-emerald-600'
        >
          Salvar
        </button>
      </form>

      <pre>
        {output}
      </pre>
    </main>
  )
}