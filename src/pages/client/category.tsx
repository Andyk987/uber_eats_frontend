import React from 'react';
import { useParams } from 'react-router-dom';
import { gql, useQuery } from '@apollo/client';
import { CATEGORY_FRAGMENT, RESTAURANT_FRAGMENT } from '../../fragments';
import { category, categoryVariables } from '../../__generated__/category';
import { Restaurant } from '../../components/restaurant';

const CATEGORY_QUERY = gql`
	query category($input: CategoryInput!) {
		category(input: $input) {
			ok
			error
			totalPages
			totalResults
			restaurants {
				...RestaurantParts
			}
			category {
				...CategoryParts
			}
		}
	}
	${RESTAURANT_FRAGMENT}
	${CATEGORY_FRAGMENT}
`;

interface ICategoryParams {
    slug: string;
}

export const Category = () => {
    const params = useParams();
    const { data, loading } = useQuery<category, categoryVariables>(CATEGORY_QUERY, {
        variables: {
            input: {
                page: 1,
                slug: params.slug,
            },
        },
    });
    console.log(data);
    return (
        <div>
            {!loading && (
                <div className="max-w-screen-2xl pb-20 mx-auto mt-8">
                    <div className="grid mt-16 md:grid-cols-3 gap-x-5 gap-y-10">
                        {data?.category.restaurants?.map((restaurant) => (
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
    );
};