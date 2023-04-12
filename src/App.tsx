import { useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

import './styles/global.css';

/** TO-DO
 * [ X ] Validação / transformação
 * [ X ] Field arrays
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
      return email.endsWith('@gmail.com');
    }, 'O e-mail precisa ser do gmail'),
  password: z.string()
    .min(6, 'A senha precisa do mínimo 6 caracteres'),
  techs: z.array(z.object({
    title: z.string().nonempty('O título é obrigatório'),
    knowledge: z.coerce
      .number()
      .min(1, 'No mínimo 1')
      .max(100, 'No máximo 100 caracteres'),
  })).min(2, 'Insira pelo menos 2 tecnologias'),
});

type CreateUserFormData = z.infer<typeof createUserFormSchema>;

export default function App() {
  const [output, setOutput] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors },
    control,
  } = useForm<CreateUserFormData>({
    resolver: zodResolver(createUserFormSchema),
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'techs',
  });

  function createUser(data: any) {
    setOutput(JSON.stringify(data, null, 2));
  }

  function addNewTech() {
    append({
      title: '',
      knowledge: 0,
    });
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
            errors.name && <span className='text-red-500 text-sm'>{errors.name.message}</span>
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
            errors.email && <span className='text-red-500 text-sm'>{errors.email.message}</span>
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
            errors.password && <span className='text-red-500 text-sm'>{errors.password.message}</span>
          }
        </div>

        <div className='flex flex-col gap-1'>
          <label htmlFor='tecnologias' className='flex justify-between items-center'>
            Tecnologias

            <button
              type='button'
              className='text-emerald-500 text-sm'
              onClick={addNewTech}
            >
              Adicionar
            </button>
          </label>

          {
            fields.map((field, index) => {
              return (
                <div
                  key={String(field.id)}
                  className='flex gap-2'
                >
                  <div className='flex-1 flex flex-col gap-1'>
                    <input
                      className='border border-zinc-200 shadow-sm rounded h-10 px-3 bg-zinc-800 text-white'
                      type='text'
                      {...register(`techs.${index}.title`)}
                    />

                    {
                      errors.techs?.[index]?.title && <span className='text-red-500 text-sm'>{errors.techs?.[index]?.title?.message}</span>
                    }
                  </div>

                  <div className='w-20 flex flex-col gap-1'>
                    <input
                      className='border border-zinc-200 shadow-sm rounded h-10 px-3 bg-zinc-800 text-white'
                      type='number'
                      {...register(`techs.${index}.knowledge`)}
                    />

                    {
                      errors.techs?.[index]?.knowledge && <span className='text-red-500 text-sm'>{errors.techs?.[index]?.knowledge?.message}</span>
                    }
                  </div>
                </div>
              )
            })
          }

          {
            errors.techs && <span className='text-red-500 text-sm'>{errors.techs.message}</span>
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