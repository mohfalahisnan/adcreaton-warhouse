import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getApplicablePrice } from "@/lib/CalculateTotalAmount";
import { formatRupiah } from "@/lib/formatRupiah";

async function Sukses({ params }: { params: { id: string } }) {
  const order = await prisma?.order.findUnique({
    where: {
      order_id: params.id,
    },
    include: {
      customer_name: true,
      Payment: true,
      OrderItem: {
        include: {
          product: true,
          satuan: true,
        },
      },
      ReturItem: {
        include: {
          orderItem: {
            include: {
              product: true,
              satuan: true,
            },
          },
        },
      },
      sales_name: true,
    },
  });
  const retur = await prisma?.returItem.findMany({
    where: {
      order_id: params.id,
    },
    include: {
      orderItem: {
        include: {
          product: true,
          satuan: true,
        },
      },
    },
  });
  if (!order || !retur) return null;
  const totalAmount = retur.reduce((acc, item) => {
    let totalQty = item.orderItem.quantity - item.quantity;
    let orderitem = item.orderItem;

    return (
      acc +
      ((orderitem.satuan?.price || 0) -
        getApplicablePrice({ ...orderitem, quantity: totalQty })) *
        totalQty
    );
  }, 0);
  return (
    <div>
      <table>
        <tbody>
          <tr>
            <td>Order</td>
            <td>:</td>
            <td>ORD-{order?.order_code}</td>
          </tr>
          <tr>
            <td>Sales</td>
            <td>:</td>
            <td>{order?.sales_name?.name}</td>
          </tr>
          <tr>
            <td valign="top">Customer</td>
            <td valign="top">:</td>
            <td>
              {order?.customer_name?.name}
              <br />
              {order?.customer_name?.alamat}
              <br />
              {order?.customer_name?.phone}
            </td>
          </tr>
        </tbody>
      </table>
      {/* <div className="text-xl font-medium mt-4">Order Retur Item</div> */}
      <Table className="border mt-6">
        <TableHeader className="bg-accent">
          <TableRow>
            <TableCell>No.</TableCell>
            <TableCell>Product</TableCell>
            <TableCell>Quantity</TableCell>
            <TableCell>Retur Qty</TableCell>
            <TableCell>Total Qty</TableCell>
            <TableCell>Final Price</TableCell>
          </TableRow>
        </TableHeader>
        <TableBody>
          {order?.ReturItem.map((item, i) => (
            <TableRow key={item.retur_id}>
              <TableCell>{i + 1}</TableCell>
              <TableCell>{item.orderItem.product.name}</TableCell>
              <TableCell>
                {item.orderItem.quantity}
                {item.orderItem.satuan?.name}
              </TableCell>
              <TableCell>
                {item.quantity}
                {item.orderItem.satuan?.name}
              </TableCell>
              <TableCell>
                {item.orderItem.quantity - item.quantity}
                {item.orderItem.satuan?.name}
              </TableCell>
              <TableCell>
                Rp.
                {formatRupiah(
                  ((item.orderItem.satuan?.price || 0) -
                    (item.orderItem.discount || 0) -
                    getApplicablePrice(item.orderItem)) *
                    item.quantity,
                )}
              </TableCell>
            </TableRow>
          ))}

          <TableRow className="bg-accent">
            <TableCell colSpan={5} className="text-right">
              Total
            </TableCell>
            <TableCell>Rp.{formatRupiah(totalAmount)}</TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </div>
  );
}
export default Sukses;
