import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { render } from '@testing-library/react';
import { Restaurant } from '../restaurant';

describe('<Restaurant />', () => {
    it('renders OK with props', () => {
        const restaurantProps = {
            id: '1',
            coverImg: 'coverImg',
            name: 'name',
            categoryName: 'categoryName',
        };

        const { debug, getByText, container } = render(
            <Router>
                <Restaurant {...restaurantProps} />
            </Router>
        );
        getByText(restaurantProps.name);
        getByText(restaurantProps.categoryName);
        expect(container.firstChild).toHaveAttribute('href', `/restaurants/${restaurantProps.id}`);
    });
});