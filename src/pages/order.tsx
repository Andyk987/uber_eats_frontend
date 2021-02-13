import { gql, useQuery, useMutation, useSubscription } from '@apollo/client';
import React, { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { getOrder, getOrderVariables } from '../__generated__/getOrder';
import { orderUpdates, orderUpdatesVariables } from '../__generated__/orderUpdates';
import { editOrder, editOrderVariables } from '../__generated__/editOrder';
import { OrderStatus, UserRole } from "../__generated__/globalTypes";
import { FULL_ORDER_FRAGMENT } from '../fragments';
import { useMe } from '../hooks/useMe';

const GET_ORDER_QUERY = gql`
	query getOrder($input: GetOrderInput!) {
		getOrder(input: $input) {
			ok
			error
			order {
				...FullOrderParts
			}
		}
	}
	${FULL_ORDER_FRAGMENT}
`;

const ORDER_SUBSCRIPTION = gql`
	subscription orderUpdates($input: OrderUpdatesInput!) {
		orderUpdates(input: $input) {
			...FullOrderParts
		}
	}
	${FULL_ORDER_FRAGMENT}
`;

const EDIT_ORDER = gql`
	mutation editOrder($input: EditOrderInput!) {
		editOrder(input: $input) {
			ok
			error
		}
	}
`;

export const Order = () => {
	const params = useParams();
	const { data: userData } = useMe();
	const [ editOrderMutation ] = useMutation<editOrder, editOrderVariables>(EDIT_ORDER); 
	const { data, subscribeToMore } = useQuery<
		getOrder,
		getOrderVariables
	>(GET_ORDER_QUERY, {
		variables: {
			input: {
				id: +params.id,
			},
		},
	});
	useEffect(() => {
		if(data?.getOrder.ok) {
			subscribeToMore({
				document: ORDER_SUBSCRIPTION,
				variables: {
					input: {
						id: +params.id,
					},
				},
				updateQuery: (prev, { subscriptionData: { data } }: { subscriptionData: { data: orderUpdates } }) => {
					if(!data) return prev;
					return {
						getOrder: {
							...prev.getOrder,
							order: {
								...data.orderUpdates,
							},
						},
					};
				},
			});
		}
	}, [data]);

	const onButtonClick = (newStatus: OrderStatus) => {
		editOrderMutation({
			variables: {
				input: {
					id: +params.id,
					status: newStatus,
				},
			},
		});
	};

	return (
		<div className="mt-32 container flex justify-center">
			<Helmet>
				<title>Order #{params.id} | Uber Eats</title>
			</Helmet>
			<div className="border border-gray-800 w-full max-w-screen-sm flex flex-col justify-center">
				<h4 className="bg-gray-800 w-full py-5 text-white text-center text-xl">
					Order #{params.id}
				</h4>
				<h5 className="p-5 pt-10 text-3xl text-center">
					${data?.getOrder.order?.total}
				</h5>
				<div className="p-5 text-xl grid gap-6">
					<div className="border-t pt-5 border-gray-700">
						Prepared By:{" "}
						<span className="font-medium">
							{data?.getOrder.order?.restaurant?.name}
						</span>
					</div>
					<div className="border-t pt-5 border-gray-700">
						Deliver To:{" "}
						<span className="font-medium">
							{data?.getOrder.order?.customer?.email}
						</span>
					</div>
					<div className="border-t border-b py-5 border-gray-700">
						Driver To:{" "}
						<span className="font-medium">
							{data?.getOrder.order?.driver?.email || "Not yet"}
						</span>
					</div>
					{userData?.me.role === "Client" && (
						<span className="text-center mt-5 mb-3 text-2xl text-lime-600">
							Status: {data?.getOrder.order?.status}
						</span>
					)}
					{userData?.me.role === UserRole.Owner && (
						<>
							{data?.getOrder.order?.status === OrderStatus.Pending && (
								<button
									onClick={() => onButtonClick(OrderStatus.Cooking)}
									className="btn"
								>
									Accept order
								</button>
							)}
							{data?.getOrder.order?.status === OrderStatus.Cooking && (
								<button
									onClick={() => onButtonClick(OrderStatus.Cooked)}
									className="btn"
								>
									Order Cooked
								</button>
							)}
							{data?.getOrder.order?.status !== OrderStatus.Cooking && data?.getOrder.order?.status !== OrderStatus.Pending && (
								<span className="text-center mt-5 mb-3 text-2xl text-lime-600">
									Status: {data?.getOrder.order?.status}
								</span>
							)}
						</>
					)}
					{userData?.me.role === UserRole.Delivery && (
						<>
							{data?.getOrder.order?.status === OrderStatus.Cooked && (
								<button
									onClick={() => onButtonClick(OrderStatus.PickedUp)}
									className="btn"
								>
									Picked Up
								</button>
							)}
							{data?.getOrder.order?.status === OrderStatus.PickedUp && (
								<button
									onClick={() => onButtonClick(OrderStatus.Delivered)}
									className="btn"
								>
									Order Delivered
								</button>
							)}
						</>
					)}
					{data?.getOrder.order?.status === OrderStatus.Delivered && (
						<span className="text-center mt-5 mb-3 text-2xl text-lime-600">
							Thank you for using Uber Eats
						</span>
					)}
				</div>
			</div>
		</div>
	)
};