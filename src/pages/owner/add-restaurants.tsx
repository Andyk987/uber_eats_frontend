import { gql, useMutation, useApolloClient } from '@apollo/client';
import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { useForm } from 'react-hook-form';
import { Button } from '../../components/button';
import { FormError } from '../../components/form-error';
import { createRestaurant, createRestaurantVariables } from '../../__generated__/createRestaurant';
import { MY_RESTAURANTS_QUERY } from './my-restaurants';
import { useHistory } from 'react-router-dom';

const CREATE_RESTAURANT_MUTATION = gql`
	mutation createRestaurant($input: CreateRestaurantInput!) {
		createRestaurant(input: $input) {
			ok
			error
			restaurantId
		}
	}
`;

interface IFormProps {
    name: string;
    address: string;
    categoryName: string;
    file: FileList;
}

export const AddRestaurant = () => {
    const client = useApolloClient();
    const history = useHistory();
    const [imageUrl, setImageUrl] = useState('');
    const onCompleted = (data: createRestaurant) => {
        const {
            createRestaurant: { ok, restaurantId },
        } = data;
        if (ok) {
            const { file, name, categoryName, address } = getValues();
            setUploading(false);
            const queryResult = client.readQuery({ query: MY_RESTAURANTS_QUERY });
            client.writeQuery({
                query: MY_RESTAURANTS_QUERY,
                data: {
                    myRestaurants: {
                        ...queryResult.myRestaurants,
                        restaurants: [
                            {
                                address,
                                category: {
                                    name: categoryName,
                                    __typename: 'Category',
                                },
                                coverImg: imageUrl,
                                id: restaurantId,
                                isPromoted: false,
                                name,
                                __typename: 'Restaurant',
                            },
                            ...queryResult.myRestaurants.restaurants,
                        ],
                    },
                },
            });
            history.push('/');
        }
    };
    const [createRestaurantMutation, { data }] = useMutation<
        createRestaurant,
        createRestaurantVariables
    >(CREATE_RESTAURANT_MUTATION, {
        onCompleted,
    });
    const { register, getValues, formState, handleSubmit, watch } = useForm<IFormProps>({
        mode: 'onChange',
    });
    watch();
    const [uploading, setUploading] = useState(false);
    const onSubmit = async () => {
        try {
            setUploading(true);
            const { file, name, categoryName, address } = getValues();
            const actualFile = file[0];
            const formBody = new FormData();
            formBody.append('file', actualFile);
            const { url: coverImg } = await (
                await fetch('https://bycproject.run.goorm.io/uploads/', {
                    method: 'POST',
                    body: formBody,
                })
            ).json();
            setImageUrl(coverImg);
            createRestaurantMutation({
                variables: {
                    input: {
                        name,
                        categoryName,
                        address,
                        coverImg,
                    },
                },
            });
        } catch (e) {}
    };
    return (
        <div className="container flex flex-col items-center mt-52">
            <Helmet>Add Restaurant | Uber Eats</Helmet>
            <h4 className="font-semibold text-2xl mb-3">Add Restaurant</h4>
            <form
                onSubmit={handleSubmit(onSubmit)}
                className="grid max-w-screen-sm gap-3 mt-5 w-full mb-5"
            >
                <input
                    className="input"
                    type="text"
                    name="name"
                    placeholder="Name"
                    ref={register({ required: 'Name is required' })}
                />
                <input
                    className="input"
                    type="text"
                    name="address"
                    placeholder="Address"
                    ref={register({ required: 'Address is required' })}
                />
                <input
                    className="input"
                    type="text"
                    name="categoryName"
                    placeholder="CategoryName"
                    ref={register({ required: 'CategoryName is required' })}
                />
                <div>
                    <input
                        type="file"
                        name="file"
                        accept="image/*"
                        ref={register({ required: true })}
                    />
                </div>
                <Button
                    loading={uploading}
                    canClick={formState.isValid}
                    actionText="Create Restaurant"
                />
                {data?.createRestaurant?.error && (
                    <FormError errorMessage={data.createRestaurant.error} />
                )}
            </form>
        </div>
    );
};