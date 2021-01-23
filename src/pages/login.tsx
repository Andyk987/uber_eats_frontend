import React from 'react';
import { gql, useMutation } from "@apollo/client";
import { useForm } from 'react-hook-form';

import { FormError } from '../components/form-error';
import { loginMutation, loginMutationVariables } from '../__generated__/loginMutation';

const LOGIN_MUTATION = gql`
	mutation loginMutation($loginInput: LoginInput!) {
		login(input: $loginInput) {
			ok
			error
			token
		}
	}
`;

interface ILoginForm {
	email: string;
	password: string;
}

export const Login = () => {
	
	const { register, getValues, errors, handleSubmit } = useForm<ILoginForm>();
	const [loginMutation, { data }] = useMutation<loginMutation, loginMutationVariables>(LOGIN_MUTATION);
	const onSubmit = () => {
		const { email, password } = getValues();
		loginMutation({
			variables: {
				loginInput: {
					email,
					password,
				},
			},
		});
	};
	
	return (
		<div className="h-screen flex items-center justify-center bg-gray-800">
			 <div className="bg-white w-full max-w-lg pt-10 pb-7 rounded-lg text-center">
				 <h3 className="text-3xl text-gray-800">Log In</h3>
				 <form
					onSubmit={handleSubmit(onSubmit)}
					className="grid gap-3 mt-5 px-5"
					 >
					 <input
						 ref={register({ required: "Email is required" })}
						 name="email"
						 required
						 type="email"
						 placeholder="Email"
						 className="input mb-3" />
					{errors.email?.message && (
						<FormError errorMessage={errors.email?.message} />
					)}
					 <input
						 ref={register({ required: "Password is required" })}
						 name="password"
						 required
						 type="password"
						 placeholder="Password"
						 className="input" />
					{errors.password?.message && (
						<FormError errorMessage={errors.password?.message} />
					)}
					{errors.password?.type === "minLength" && (
						<FormError errorMessage="Password must be more than 10 chars." />
					)}
					<button className="mt-3 btn">Log In</button>
				</form>
			</div>
		</div>
	)
}