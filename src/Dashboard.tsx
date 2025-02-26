import {useState, useEffect} from 'react'
import {Container, Row, Col, Table, ProgressBar, Carousel, Image} from 'react-bootstrap'
import { Line } from 'react-chartjs-2'; // Import Pie chart
import { Chart as ChartJS, ArcElement, Tooltip, Legend,  CategoryScale, LinearScale, PointElement, LineElement, Title } from 'chart.js';
import { useUser } from './UserContext';
import { supabase } from './supabaseClient';

// Register the components
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, ArcElement, Title, Tooltip, Legend);


export default function Dashboard() {
    type TransactionType = {
        id: number;
        user_id?: string | null; // UUID, can be null
        type: "income" | "expense"; // Enforced by the CHECK constraint
        title: string;
        amount: number; // Numeric(10,2) is represented as a number in JavaScript
        category: string;
        note?: string | null; // Nullable text
        created_at?: string | null; // Nullable timestamp (ISO 8601 format as a string)
      };
      type Goal = {
        id: number;
        user_id: string | null; // UUID can be a string or null
        title: string;
        target_amount: number;
        current_amount: number;
        note?: string | null; // Optional note field
        created_at: string; // Supabase returns timestamps as strings
    };
    const { user} = useUser();
    
    
    console.log(user?.email)
    const [transactions, setTransaction] = useState<TransactionType[]>([]);
    const [chartData, setChartData] = useState<any>({
        labels: [],
        datasets: []
    });
    
    const [goals, setGoal] = useState<Goal[]>([]);
    const [totalIncome, setTotalIncome] = useState<number>(0);
    const [totalExpense, setTotalExpense] = useState<number>(0);
    const [balance, setBalance] = useState(0);

   // const [loading, setLoading] = useState(true);

    const fetchTransactions = async () => {
        if (!user) return;
       // setLoading(true);

        const {data, error} = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', {ascending: false});

        if (error) {
            console.error('Error fetching transactions:', error);
        } else {
            setTransaction(data);
            calculateTotals(data);
            const chartData = processTransactionData(data);
            setChartData(chartData);
            
        }
        //setLoading(false);
    }

    type Transaction = {
        id: number;  // Assuming each transaction has a unique ID
        type: 'income' | 'expense';
        amount: number;
    };
    
const calculateTotals = (transactions: Transaction[]) => {
    let income = 0;
    let expense = 0;

    transactions.forEach((transaction) => {
        if (transaction.type === 'income') {
            income += transaction.amount;
        } else if (transaction.type === 'expense') {
            expense += transaction.amount;
        }
    });

    setTotalIncome(income);
    setTotalExpense(expense);
    setBalance(income - expense);
};

    const fetchGoals = async () => {
        if (!user) return;
       // setLoading(true);

        const {data, error} = await supabase
        .from('goals')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', {ascending: false});

        if (error) {
            console.error('Error fetching Goals:', error);
        } else {
            setGoal(data);
            console.log(data)
        }
        //setLoading(false);
    }

    useEffect(() => {
        fetchTransactions();
        fetchGoals();
    },[])


// Process transactions into monthly income and expense data
type MonthlyData = Record<string, { income: number; expense: number }>;

const processTransactionData = (transactions: TransactionType[]) => {
    // Define months
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sept', 'Oct', 'Nov', 'Dec'];

    // Initialize monthly data
    const monthlyData: MonthlyData = months.reduce((acc, month) => {
        acc[month] = { income: 0, expense: 0 };
        return acc;
    }, {} as MonthlyData);

    // Process transactions
    transactions.forEach(({ created_at, type, amount }) => {
        if (!created_at) return; // Ensure created_at exists

        const date = new Date(created_at);
        const monthName = months[date.getMonth()]; // Get month name

        if (monthName && type in monthlyData[monthName]) {
            monthlyData[monthName][type] += amount;
        }
    });

    // Prepare chart data
    const labels = months;
    const incomeData = months.map((month) => monthlyData[month].income);
    const expenseData = months.map((month) => monthlyData[month].expense);

    return {
        labels,
        datasets: [
            {
                label: 'Income',
                data: incomeData,
                borderColor: '#FFD0EC',
                backgroundColor: '#FFD0EC',
                fill: false,
                tension: 0.1,
            },
            {
                label: 'Expense',
                data: expenseData,
                borderColor: '#81689D',
                backgroundColor: '#81689D',
                fill: false,
                tension: 0.1,
            },
        ],
    };
};


const options = {
    responsive: true,
    plugins: {
        legend: {
            position: 'top' as const, 
            labels: {
                color: '#81689D',
            }
        },
        title: {
            display: true,
            text: 'Income vs Expense',
            color: '#FFD0EC',
            font: {
                size: 18,
                weight: 'bold' as "bold" | "normal" | "lighter" | "bolder",
            }
            
        },
        tooltip: {
            bodyColor: '#FFD0EC',
            titleColor: '#FFD0EC',
        }
    },
    scales: {
        x: {
            ticks: {
                color: '#FFD0EC',
            }
        },
        y: {
            ticks: {
                color: '#FFD0EC',
            }
        }
    }
};

    
      // Prepare data for the pie chart
 
    
    return (
        <Container className='px-0 100vh'>
      <Row className="d-md-flex flex-md-row mx-0 px-0 custom-height-up mt-4 mb-4 h-100">
            <Col xs={12} md={4} className="d-flex align-items-center justify-content-center  ">
                <Container fluid className='rounded mt-2 position-relative h-100'>
                <Image fluid src="./Frame 2.png" className="shadow-sm rounded w-100 h-100 position-absolute top-0 start-0" style={{ objectFit: "cover", zIndex: "-1" }}/>
                        
                        {/* Container fits inside Col */}
                        <Container fluid className=" mt-3 position-relative ">
                        <Carousel interval={3000} indicators={false} className="my-1">
                                {goals?.length > 0 ? (
                                    goals.map((goal) => (
                                        <Carousel.Item key={goal.id}> {/* Use `goal.id` instead of `index` */}
                                            <Container fluid className="text-center p-3">
                                                <h5 className="fw-bold custom-font-color1">{goal.title}</h5>
                                                <Container fluid>
                                                    <Container fluid className="d-flex justify-content-center mt-2 mb-1">
                                                        <span className="fw-bold custom-font-color1">
                                                            {goal.current_amount} / {goal.target_amount}
                                                        </span>
                                                    </Container>
                                                    <ProgressBar className="custom-bg-color4">
                                                        <ProgressBar
                                                            now={(goal.current_amount / goal.target_amount) * 100}
                                                            label={`${((goal.current_amount / goal.target_amount) * 100).toFixed(1)}%`}
                                                            key={goal.id}
                                                            className="custom-bg-color1 custom-color-font4"
                                                        />
                                                    </ProgressBar>
                                                </Container>
                                            </Container>
                                        </Carousel.Item>
                                    ))
                                ) : (
                                    <div>No goals available</div>
                                )}
                            </Carousel>
                        </Container>
                </Container>
            </Col>
            <Col xs={12} md={8} className="h-100">
                <Container fluid className="h-100 d-flex align-items-center justify-content-center custom-bg-color4 rounded mt-2">
                    {chartData?.datasets?.length > 0 ? (
                        <Line data={chartData} className="mb-2 mt-3 py-2" options={options} />
                    ) : (
                        <div>Loading chart data...</div>
                    )}
                </Container>
            </Col>
        </Row>

            <Row className='mx-0 px-0 custom-height-down'>
      
            <Col md={12} className='rounded mt-2'>
            <Row className='d-flex'>
                <Col md={4}>
                <Container fluid className="d-flex flex-column justify-content-center align-items-center text-center rounded shadow-sm bg-white mt-3 p-3"
                            >
                                <h5 className="custom-font-color5 custom-font-family fw-semibold fs-5">
                                    Total Expense
                                </h5>
                                <h4 className="custom-font-color5 custom-font-family-fredoka fw-semibold fs-4">
                                    ₱ {totalExpense}
                                </h4>
                           
                    </Container>
                </Col>
                <Col md={4}>
                <Container fluid className="d-flex flex-column justify-content-center align-items-center text-center rounded shadow-sm bg-white mt-3 p-3"
                            >
                                <h5 className="custom-font-color5 custom-font-family fw-semibold fs-5">
                                    Total Income
                                </h5>
                                <h4 className="custom-font-color5 custom-font-family-fredoka fw-semibold fs-4">
                                    ₱ {totalIncome}
                                </h4>
                           
                    </Container></Col>
                <Col md={4}>
                <Container fluid className="d-flex flex-column justify-content-center align-items-center text-center rounded shadow-sm bg-white mt-3 p-3"
                            >
                                <h5 className="custom-font-color5 custom-font-family fw-semibold fs-5">
                                    Total Balance
                                </h5>
                                <h4 className="custom-font-color5 custom-font-family-fredoka fw-semibold fs-4">
                                    ₱ {balance}
                                </h4>
                           
                    </Container></Col>
            </Row>

            <Row className='d-flex justify-content-center align-items-center mt-2'>
            <Container className="shadow-sm rounded p-3">
            <Table responsive className="mt-3">
                <thead>
                    <tr>
                        <th colSpan={2}>
                            <h4 className="mt-3 mb-3 text-left custom-font-color4 custom-font-family fw-semibold">
                                Recent Transactions
                            </h4>
                        </th>
                    </tr>
                </thead>
                <tbody>
                    {transactions.length > 0 ? (
                        transactions.map((transaction) => (
                            <tr key={transaction.id}>
                                <td>
                                    <h6 className="mt-3 mb-3 custom-font-color4 custom-font-family fw-regular fs-6">
                                        {transaction.category}
                                    </h6>
                                </td>
                                <td className="text-end">
                                    <h6 className="mt-3 mb-3 custom-font-color4 custom-font-family fw-regular fs-6">
                                        {transaction.type === 'expense' ? '- ' : '+ '}₱ {transaction.amount}
                                    </h6>
                                </td>
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan={2} className="text-center text-muted">No recent transactions</td>
                        </tr>
                    )}
                </tbody>
            </Table>
        </Container>
              
                  </Row>
            </Col>
          

            </Row>


        </Container>
    )
}