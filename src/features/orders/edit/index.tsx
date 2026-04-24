import { useEffect, useState } from "react";
import { OrderDetailsDto, OrderUpdateDto } from "lib/network/swagger-client";
import { useRequestContext } from "providers/request-provider";
import { OrderForm } from "../form";
import { useParams } from "react-router-dom";
import { type IdRouteParams } from "@lib/router";

export const OrderEdit = () => {
  const { client } = useRequestContext();

  const { id: idParam } = useParams<IdRouteParams>();
  const id = Number(idParam);

  const [order, setOrder] = useState<OrderDetailsDto>();

  useEffect(() => {
    (async () => {
      try {
        const { data } = await client.api.ordersDetail(id);
        setOrder(data);
      } catch (e) {
        console.log(e);
      }
    })();
  }, [client]);

  const handleSave = async (newOrder: OrderDetailsDto) => {
    const updateDto: OrderUpdateDto = {
      ...newOrder!,
    };
    await client.api.ordersPartialUpdate(id, updateDto!);
  };

  const handleDelete = async (orderId: number) => {
    await client.api.ordersDelete(orderId);
  };

  return (
    <OrderForm
      order={order}
      updateOrder={setOrder}
      handleSave={handleSave}
      handleDelete={handleDelete}
      isEdit={true}
    />
  );
};
