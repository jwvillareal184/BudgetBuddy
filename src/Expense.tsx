import { useState, useEffect } from "react"; 
import {Container, Modal, Image, Row, Col, Table, Button, Form} from 'react-bootstrap'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrash, faEdit, faPesoSign, faCalendar, faNoteSticky } from '@fortawesome/free-solid-svg-icons';
import { Bar } from 'react-chartjs-2'; // Import Bar for the bar chart
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { useUser } from './UserContext';
import { supabase } from './supabaseClient';
// Register Chart.js components
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

export default function Expense() {
    const { user} = useUser();
    console.log(user?.email);

    const [showAddModal, setShowAddModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [loading, setLoading] = useState(true);
    const [transactions, setTransaction] = useState([]);
    const [selectedTransaction, setSelectedTransaction] = useState(null);
    const [weeklyExpense, setWeeklyExpense] = useState<Map<string, number>>(new Map()); 
    const [data, setData] = useState<any>(null);
    const [addExpense, setAddExpense] = useState({
        title: '',
        amount: '',
        category: '',
        note: '',
        created_at: new Date().toISOString().slice(0,10)
    });

    const handleChange= (e) => {
        const {name, value} = e.target;
        setAddExpense({...addExpense, [name]: value});
    }

    
    useEffect(() => {
        fetchTransactions();
    },[])

    const handleAddexchange = async () => {
        if(!addExpense.title || !addExpense.amount || !addExpense.category ) {
            alert('Please fill the all the required fields.');
            return;
        }

      
        const user_id = user?.id;

        const {data, error} = await supabase.from('transactions').insert([{
            user_id,
            title: addExpense.title,
            amount: addExpense.amount,
            category: addExpense.category,
            note: addExpense.note,
            created_at: addExpense.created_at,
            type: 'expense'
        }]);

        if (error) {
            console.error('Error adding expense:', error);
            alert('Failed to add expense.');
        } else {
            console.log('Expense added:', data);
            alert('Expense added successfully!');
            fetchTransactions();
            setShowAddModal(false);
            setAddExpense({ title: '', amount: '', category: '', note: '', created_at: new Date().toISOString().slice(0, 10) });
        }

    }

    const fetchTransactions = async () => {
        if (!user) return;
        setLoading(true);

        const {data, error} = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', user.id)
        .eq('type', 'expense')
        .order('created_at', {ascending: false});

        if (error) {
            console.error('Error fetching transactions:', error);
        } else {
            setTransaction(data);
            fetchWeeklyExpense(data);
            calculateWeeklyCategoryTrends(data);
            console.log(weeklyExpense)
        }
        setLoading(false);
    }

    const handleDelete = async (id) => {
        try {
            const { error } = await supabase
                .from('transactions')
                .delete()
                .eq('id', id); // Correct syntax
    
            if (error) {
                throw error; // Ensure error is caught
            }
    
            // Update UI by removing the deleted transaction
            setTransaction(prev => prev.filter(transaction => transaction.id !== id));
    
        } catch (error) {
            console.error("Error deleting transaction:", error.message);
        }
    };

    const handleEditTransaction = async () => {
        if (!selectedTransaction) return;
    
        try {
            const { data, error } = await supabase
                .from("transactions")
                .update({
                    title: selectedTransaction.title,
                    amount: selectedTransaction.amount,
                    category: selectedTransaction.category,
                    note: selectedTransaction.note
                })
                .eq("id", selectedTransaction.id); // Update where id matches
    
            if (error) throw error;
            alert('Transaction updated!');
            // Update UI: Refresh transactions list
            setTransactions(prev =>
                prev.map(transaction =>
                    transaction.id === selectedTransaction.id ? { ...transaction, ...selectedTransaction } : transaction
                )
            );
            
    
            handleCloseEditModal(); // Close modal after update
        } catch (error) {
            console.error("Error updating transaction:", error.message);
        }
    };

    const fetchWeeklyExpense = (transactions: { amount: number; created_at: string }[]) => {
        const currentWeekStart = getCurrentWeekStart();
        let totalAmount = 0;

        transactions.forEach(transaction => {
            const date = new Date(transaction.created_at);
            // Check if the transaction date is within the current week
            if (date >= currentWeekStart && date < new Date(currentWeekStart.getTime() + 7 * 24 * 60 * 60 * 1000)) {
                totalAmount += transaction.amount;
            }
        });

        setWeeklyExpense(totalAmount);
    };

    const getCurrentWeekStart = (): Date => {
        const now = new Date();
        const dayOfWeek = now.getUTCDay(); // Sunday is 0, Monday is 1, ..., Saturday is 6
        const diffToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek; // Adjust for Sunday
        now.setUTCDate(now.getUTCDate() + diffToMonday);
        now.setUTCHours(0, 0, 0, 0); // Set time to midnight for consistency
        return now;
    };

    const calculateWeeklyCategoryTrends = (transactions: { amount: number; created_at: string; category: string }[]) => {
        const currentWeekStart = getCurrentWeekStart();
        const categoryTotals: { [key: string]: number } = {};
    
        transactions.forEach(transaction => {
            const date = new Date(transaction.created_at);
            // Check if the transaction date is within the current week
            if (date >= currentWeekStart && date < new Date(currentWeekStart.getTime() + 7 * 24 * 60 * 60 * 1000)) {
                // Sum amounts by category
                if (!categoryTotals[transaction.category]) {
                    categoryTotals[transaction.category] = 0;
                }
                categoryTotals[transaction.category] += transaction.amount;
            }
        });
    
        setChartData(categoryTotals);
    };

    const dateConverter = (date) => {
        const newDate = new Date(date);

        const options = {year: 'numeric', month: 'long', day: 'numeric'};
        const formattedDate = newDate.toLocaleDateString('en-US', options);

        return formattedDate;
    }

    const setChartData = (categoryTotals: { [key: string]: number }) => {
        const labels = Object.keys(categoryTotals);
        const data = Object.values(categoryTotals);
    
        const chartData = {
            labels,
            datasets: [
                {
                    label: 'Weekly Expense by Category',
                    backgroundColor: '#FFD0EC',
                    borderColor: '#FFD0EC',
                    borderWidth: 1,
                    hoverBackgroundColor: '#FFD0EC',
                    hoverBorderColor: '#FFD0EC',
                    data,
                },
            ],
        };
    
        setData(chartData); // Assuming you have a state variable to hold chart data
    };

    const options = {
        responsive: true,
        plugins: {
            legend: {
                position: 'bottom' as const,
                labels: {
                    color: '#FFD0EC', // Color for legend labels
                },
            },
            title: {
                display: true,
                text: 'Expense Trend',
                color: '#FFD0EC', // Color for title text
                font: {
                    
                    weight: 'bold', // Optional: Make text bold
                },
            },
        },
        scales: {
            x: {
                grid: {
                    display: false, // Hide vertical grid lines
                },
                ticks: {
                    color: '#FFD0EC', // Color for x-axis labels
                  
                },
            },
            y: {
                beginAtZero: true, // Start y-axis at 0
                ticks: {
                    color: '#FFD0EC', // Color for y-axis labels
                   
                },
            },
        },
    };
    
    

  const MyChart = () => {
    return (
        <div>
            {data ? <Bar data={data} options={options} /> : <p>No data available</p>}
        </div>
    );
};

    const handleShowAddModal = () => {
        setShowAddModal(true);
    }

    const handleCloseAddModal = () => {
        setShowAddModal(false);
    }

    const handleShowEditModal = (transaction) => {
        setShowEditModal(true);
        setSelectedTransaction(transaction);
    }

    const handleCloseEditModal = () => {
        setShowEditModal(false);
    }
    return(
        <Container className='mb-2'>
            <Container fluid className='d-flex justify-content-between align-items-center mb-2 mt-3'>
            <h1 className='custom-font-family-fredoka fw-semibold custom-color-font4 fs-1'>Expense</h1>
            <Button className='custom-button fs-3 fw-semibold rounded-pill' onClick={handleShowAddModal}>Add</Button>
            </Container>
            <Container fluid>
                <Row className='g-5'>
                    <Col md={3}>
                    <Row className="custom-height-30">
                        <Container fluid className="h-100 position-relative">
                            {/* Background Image */}
                            <Image 
                                src="./Frame 2.png" 
                                className="shadow-sm rounded w-100 h-100 position-absolute top-0 start-0"
                                style={{ objectFit: "cover", zIndex: "-1" }}
                            />
                            
                            {/* Text Content Overlay */}
                            <Container 
                                fluid 
                                className="position-absolute top-0 start-0 w-100 h-100 d-flex flex-column justify-content-center align-items-center text-center"
                            >
                                <h5 className="custom-font-color1 custom-font-family fw-semibold fs-5">
                                    Total Expense
                                </h5>
                                <h3 className="custom-font-color1 custom-font-family-fredoka fw-semibold fs-3">
                                    ₱ {weeklyExpense}
                                </h3>
                                <h6 className="custom-font-color1 custom-font-family fs-6">
                                    Current Week
                                </h6>
                            </Container>
                        </Container>
                    </Row>


                    <Row className='custom-height-45 custom-bg-color5 rounded mt-3 shadow-sm'>
                        <Container fluid className='h-100 shadow-sm'>
                            <h4 className='mt-3 mb-3 text-left custom-font-color1 custom-font-family fw-semibold'>Trend</h4>
                            <MyChart />
                            

                        </Container>
                    </Row>
                    
                    </Col>
                    <Col md={9}>
                     
                  <Row className='shadow-sm rounded'>
                    <Table hover style={{objectFit: "cover"}} className='100vh'>
                            <tbody>
                            {loading ? ( 
                                <tr> 
                                    <td>Loading...</td> 
                                </tr>
                            ) : transactions.length > 0 ? ( 
                                transactions.map((transaction) => ( 
                                    <tr key={transaction.id} >
                                    <td className='mt-3'>Income Image</td>
                                    <td className='mt-3 me-3'>
                                        <Row><h3 className='custom-font-family-fredoka fw-semibold custom-color-font4 fs-3'>{transaction.title}</h3></Row>
                                        <Row className='mx-0 px-0'>
                                            <Col className='d-flex align-items-center'>
                                            <FontAwesomeIcon icon={faPesoSign} className='rounded-pill custom-font-color3 px-2 py-2 custom-bg-color4' />
                                            <p className='fs-6 custom-font-color4 my-2 mx-2'>{transaction.amount}</p></Col>
                                            <Col className='d-flex align-items-center'>
                                            <FontAwesomeIcon icon={faCalendar} className='rounded-pill custom-font-color3 px-2 py-2 custom-bg-color4'/>
                                            <p className='fs-6 custom-font-color4 my-2 mx-2'>{dateConverter(transaction.created_at)}</p>
                                             </Col>
                                            <Col className='d-flex align-items-center'>
                                            <FontAwesomeIcon icon={faNoteSticky} className='rounded-pill custom-font-color3 px-2 py-2 custom-bg-color4'/> 
                                            <p className='fs-6 custom-font-color4 my-2 mx-2'>{transaction.category}</p>
                                            </Col>
                                            <Col className="d-flex justify-content-between align-items-center border-0">
                                                <div className="button-container ">
                                                    <Button className="custom-button rounded-pill" onClick={() => handleShowEditModal(transaction)}>
                                                        <FontAwesomeIcon icon={faEdit} className="fs-2" />
                                                    </Button>
                                                </div>
                                                <div className="button-container">
                                                <Button className="custom-button rounded-pill" onClick={() => handleDelete(transaction.id)}>
                                                    <FontAwesomeIcon icon={faTrash} className="fs-2" />
                                                </Button>

                                                </div>
                                            </Col>

                                        </Row>
                                    </td>
                                   
                                </tr>
                                 ))
                            ) : ( 
                                <tr> 
                                    <td>No transactions found</td> 
                                </tr>
                            )}
                            </tbody>
                        </Table>
              
                  </Row>
                      
                    </Col>
                </Row>
            </Container>

            <Modal show={showAddModal} onHide={handleCloseAddModal}>
                <Modal.Header closeButton>
                    <Modal.Title className='custom-font-family-fredoka custom-color-font5 fw-semibold fs-4'>Add Expense</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form className='d-grid gap-2'>
                        <Form.Group controlId="formBasicExpense">
                            <Form.Control name="title" className='rounded-pill py-2 px-3 fs-6 custom-color-font5 fw-regular custom-form-input' value={addExpense.title} onChange={handleChange} type='text' placeholder='Title'/>
                        </Form.Group>
                        <Form.Group controlId='formBasicExpense'>
                            <Form.Control name="amount" className='rounded-pill py-2 px-3 fs-6 custom-color-font5 fw-regular custom-form-input' value={addExpense.amount} onChange={handleChange} type='number' placeholder='Amount'/>
                        </Form.Group>
                      
                        <Form.Group controlId='formBasicExpense'>
                            <Form.Select name="category" className='rounded-pill py-2 px-3 fs-6 custom-color-font5 fw-regular custom-form-input' value={addExpense.category } onChange={handleChange}>
                                <option value=''>Select Category</option>
                                <option value='Household Expenses'>Household Expenses</option>
                                <option value='Transportation'>Transportation</option>
                                <option value='Food'>Food</option>
                                <option value='Health & Wellness'>Health & Wellness</option>
                                <option value='Personal & Lifestyle'>Personal & Lifestyle</option>
                                <option value='Education'>Education</option>
                                <option value='Debt & Financial Obligations'>Debt & Financial Obligations</option>
                                <option value='Miscellaneous'>Miscellaneous</option>
                            </Form.Select>
                        </Form.Group>
                        <Form.Group controlId='formBasicExpense'>
                            <Form.Control name="note" className='rounded-pill py-2 px-3 fs-6 custom-color-font5 fw-regular custom-form-input' value={addExpense.note} onChange={handleChange} type='textarea' placeholder='Note'/>
                        </Form.Group>
                    </Form>

                </Modal.Body>
                <Modal.Footer>
                    <Button className='rounded-pill w-100 py-2 px-3 fs-6 custom-button5 fw-semibold' onClick={handleAddexchange}>Add</Button>
                </Modal.Footer>
            </Modal>

            <Modal show={showEditModal} onHide={handleCloseEditModal}>
    <Modal.Header closeButton>
        <Modal.Title className='custom-font-family-fredoka custom-color-font5 fw-semibold fs-4'>Edit Expense</Modal.Title>
    </Modal.Header>
    <Modal.Body>
        <Form className='d-grid gap-2'>
            <Form.Group controlId="formBasicIncome">
                <Form.Control 
                    className='rounded-pill py-2 px-3 fs-6 custom-color-font5 fw-regular custom-form-input' 
                    type='text' 
                    placeholder='Title' 
                    value={selectedTransaction?.title || ''} 
                    onChange={(e) => setSelectedTransaction(prev => ({ ...prev, title: e.target.value }))} 
                />
            </Form.Group>
            <Form.Group controlId='formBasicIncome'>
                <Form.Control 
                    className='rounded-pill py-2 px-3 fs-6 custom-color-font5 fw-regular custom-form-input' 
                    type='number' 
                    placeholder='Amount' 
                    value={selectedTransaction?.amount || ''} 
                    onChange={(e) => setSelectedTransaction(prev => ({ ...prev, amount: e.target.value }))} 
                />
            </Form.Group>
            <Form.Group controlId='formBasicIncome'>
                <Form.Select 
                    className='rounded-pill py-2 px-3 fs-6 custom-color-font5 fw-regular custom-form-input'
                    value={selectedTransaction?.category || ''} 
                    onChange={(e) => setSelectedTransaction(prev => ({ ...prev, category: e.target.value }))}>
                        <option value=''>Select Category</option>
                        <option value='Household Expenses'>Household Expenses</option>
                        <option value='Transportation'>Transportation</option>
                        <option value='Food'>Food</option>
                        <option value='Health & Wellness'>Health & Wellness</option>
                        <option value='Personal & Lifestyle'>Personal & Lifestyle</option>
                        <option value='Education'>Education</option>
                        <option value='Debt & Financial Obligations'>Debt & Financial Obligations</option>
                        <option value='Miscellaneous'>Miscellaneous</option>
                </Form.Select>
            </Form.Group>
            <Form.Group controlId='formBasicIncome'>
                <Form.Control 
                    className='rounded-pill py-2 px-3 fs-6 custom-color-font5 fw-regular custom-form-input' 
                    type='text' 
                    placeholder='Note' 
                    value={selectedTransaction?.note || ''} 
                    onChange={(e) => setSelectedTransaction(prev => ({ ...prev, note: e.target.value }))} 
                />
            </Form.Group>
        </Form>
    </Modal.Body>
    <Modal.Footer>
        <Button className='rounded-pill w-100 py-2 px-3 fs-6 custom-button5 fw-semibold' onClick={handleEditTransaction}>Update</Button>
    </Modal.Footer>
</Modal>

        </Container>
    );
}