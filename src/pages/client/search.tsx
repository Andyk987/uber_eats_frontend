import React, { useEffect, useState } from 'react';
import { useHistory, useLocation } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { gql, useLazyQuery } from '@apollo/client';
import { RESTAURANT_FRAGMENT } from '../../fragments';
import { searchRestaurant, searchRestaurantVariables } from '../../__generated__/searchRestaurant';
import { Restaurant } from '../../components/restaurant';

const SEARCH_RESTAURANT = gql`
	query searchRestaurant($input: SearchRestaurantInput!) {
		searchRestaurant(input: $input) {
			ok
			error
			totalPages
			totalResults
			restaurants {
				...RestaurantParts
			}
		}
	}
	${RESTAURANT_FRAGMENT}
`;

export const Search = () => {
	const location = useLocation();
	const history = useHistory();
	const [page, setPage] = useState(1);
	const [callQuery, { loading, data, called }] = useLazyQuery<
		searchRestaurant,
		searchRestaurantVariables
	>(SEARCH_RESTAURANT);
	useEffect(() => {
		const [_, query] = location.search.split("?term=");
		if(!query) {
			return history.replace("/");
		}
		callQuery({
			variables: {
				input: {
					page,
					query,
				},
			},
		});
	}, [history, location]);
	console.log(loading, data, called);
	return (
		<div>
			<Helmet>
				<title>Search | Uber Eats</title>
			</Helmet>
			{!loading && (
				<div className="max-w-screen-2xl pb-20 mx-auto mt-8">
					<div className="grid mt-16 md:grid-cols-3 gap-x-5 gap-y-10">
						{data?.searchRestaurant.restaurants?.map((restaurant) => (
							 <Restaurant
                                key={restaurant.id}
                                id={restaurant.id + ''}
                                coverImg={restaurant.coverImg}
                                name={restaurant.name}
                                categoryName={restaurant.category?.name}
                            />
						))}
					</div>
				</div>
			)}
		</div>
	)
}