import { StockItem } from '@/types';
import {Table, TableHeader, TableBody, TableHead, TableRow, TableCell} from '@/components/ui/table';
import { formatDistanceToNow } from 'date-fns';
import { ar } from 'date-fns/locale';

interface StockTableProps {
  items: StockItem[];
}

const StockTable = ({ items }: StockTableProps) => {
  console.log("The items is : " , items);
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead style={{textAlign:'start'}}>الإسم</TableHead>
            <TableHead style={{textAlign:'start'}}>الكمية</TableHead>
            <TableHead style={{textAlign:'start'}}>الوحدة</TableHead>
            {
                items.length > 0 && items[0]?.price > 0 ? (<TableHead style={{textAlign:'start'}}>سعر الفيتامين</TableHead>) : null
            }
            {
              items.length > 0 && !(items[0]?.reputation === '') ? (<TableHead style={{textAlign:'start'}}>التكرار</TableHead>) : null
            }
            <TableHead style={{textAlign:'start'}}>أخر تحديث</TableHead>
            <TableHead style={{textAlign:'start'}}>الملاحظات</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {items?.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                لا يوجد عناصر
              </TableCell>
            </TableRow>
          ) : (
            items?.map((item) => (
              <TableRow key={item?.id}>
                <TableCell className="font-medium">{item?.name}</TableCell>
                <TableCell>{item?.quantity}</TableCell>
                <TableCell>{item?.unit}</TableCell>
                {
                  item.price > 0 ? <TableCell>{item?.price}</TableCell> : null
                }
                {
                    !(item.reputation === '') ? <TableCell>{item?.reputation}</TableCell> : null
                }
                <TableCell>
                  {formatDistanceToNow(new Date(item.updatedAt), {
                    addSuffix: true,
                    locale: ar,
                  })}
                </TableCell>
                <TableCell>{item?.notes || "—"}</TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export default StockTable;
