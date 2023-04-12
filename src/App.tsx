import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

import './styles/global.css';

/** TO-DO
 * [ X ] Validação / transformação
 * [ ] Field arrays
 * [ ] Upload de arquivos
 * [ ] Coomposition Pattern
 */

const createUserFormSchema = z.object({
  name: z.string()
    .nonempty('O nome é obrigatório')
    .transform(name => {
      return name.trim().split(' ').map(word => {
        return word[0].toLocaleUpperCase().concat(word.substring(1));
      }).join(' ');
    }),
  email: z.string()
    .nonempty('O e-mail é obrigatório')
    .email('Formato de e-mail inválido')
    .refine(email => {
      return email.endsWith("@gmail.com");
    }, 'O e-mail precisa ser do gmail'),
  password: z.string()
    .min(6, 'A senha precisa do mínimo 6 caracteres'),
});

type CreateUserFormData = z.infer<typeof createUserFormSchema>;

export default function App() {
  const [output, setOutput] = useState('');
  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<CreateUserFormData>({
    resolver: zodResolver(createUserFormSchema),
  });

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
          <label htmlFor='name'>
            Nome
          </label>

          <input
            className='border border-zinc-200 shadow-sm rounded h-10 px-3 bg-zinc-800 text-white'
            type='text'
            {...register('name')}
          />

          {
            errors.name && <span>{errors.name.message}</span>
          }
        </div>

        <div className='flex flex-col gap-1'>
          <label htmlFor='email'>
            E-mail
          </label>

          <input
            className='border border-zinc-200 shadow-sm rounded h-10 px-3 bg-zinc-800 text-white'
            type='email'
            {...register('email')}
          />

          {
            errors.email && <span>{errors.email.message}</span>
          }
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

          {
            errors.password && <span>{errors.password.message}</span>
          }
        </div>

        <button
          type='submit'
          className='h-10 bg-emerald-500 rounded font-semibold text-white hover:bg-emerald-600'
        >
          Salvar
        </button>
      </form>

      {
        output && <pre>{output}</pre>
      }
    </main >
  )
}