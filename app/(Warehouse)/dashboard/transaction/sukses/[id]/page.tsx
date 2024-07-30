async function Sukses({ params }: { params: { id: string } }) {
  const order = await prisma?.order.findUnique({
    where: {
      order_id: params.id,
    },
    include: {
      customer_name: true,
      sales_name: true,
      OrderItem: {
        include: {
          ReturItem: true,
          product: true,
          satuan: true,
        },
      },
    },
  });
  return (
    <div>
      Order : {order?.order_code}
      <br />
      Sales: {order?.sales_name?.name}
      <br />
      Customer: <br />
      {order?.customer_name?.name} <br />
      {order?.customer_name?.alamat}
      <br />
      {order?.customer_name?.phone}
    </div>
  );
}
export default Sukses;
