import {useEffect, useState} from 'react'
import {Container, Modal, Image, Row, Col, Table, Button, Form} from 'react-bootstrap'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrash, faEdit, faPesoSign, faCalendar, faNoteSticky } from '@fortawesome/free-solid-svg-icons';
import { Pie } from 'react-chartjs-2'; // Import Pie chart
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { useUser } from './UserContext';
import { supabase } from './supabaseClient';
import Frame2 from "./assets/Frame 2.png"

// Register required Chart.js components
ChartJS.register(ArcElement, Tooltip, Legend);

type TransactionType = {
    id: string;
    user_id?: string | null; // UUID, can be null
    type: "income"; // Enforced by the CHECK constraint
    title: string;
    amount: number; // Numeric(10,2) is represented as a number in JavaScript
    category: string;
    note?: string | null; // Nullable text
    created_at?: string | null; // Nullable timestamp (ISO 8601 format as a string)
  };

export default function Income() {
    const { user} = useUser();
    console.log(user?.email);
    const [showAddModal, setShowAddModal] = useState<boolean>(false);
    const [showEditModal, setShowEditModal] = useState<boolean>(false);
    const [loading, setLoading] = useState(true);
    const [transactions, setTransaction] = useState<TransactionType[]>([]);
    const [selectedTransaction, setSelectedTransaction] = useState<TransactionType | null>(null);
    const [weeklyIncome, setWeeklyIncome] = useState<number>(0);

    interface PieChartData {
        labels: string[];
        datasets: {
            data: number[];
            backgroundColor: string[];
            borderColor: string[];
            borderWidth: number;
        }[];
    }
    
    const [pieChartData, setPieChartData] = useState<PieChartData>({
        labels: [],
        datasets: [
            {
                data: [],
                backgroundColor: [],
                borderColor: [],
                borderWidth: 1,
            },
        ],
    });
    

    useEffect(() => {
        fetchTransactions();
    },[])

    const [addIncome, setAddIncome] = useState({
        title: '',
        amount: '',
        category: '',
        note: '',
        created_at: new Date().toISOString().slice(0,10)
    });

    const handleChange= (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const {name, value} = e.target;
        setAddIncome({...addIncome, [name]: value});
    }

    
    const handleAddIncome = async () => {
        if(!addIncome.title || !addIncome.amount || !addIncome.category ) {
            alert('Please fill the all the required fields.');
            return;
        }

      
        const user_id = user?.id;

        const {data, error} = await supabase.from('transactions').insert([{
            user_id,
            title: addIncome.title,
            amount: addIncome.amount,
            category: addIncome.category,
            note: addIncome.note,
            created_at: addIncome.created_at,
            type: 'income'
        }]);

        if (error) {
            console.error('Error adding income:', error);
            alert('Failed to add income.');
        } else {
            console.log('Income added:', data);
            alert('Income added successfully!');
            fetchTransactions();
            setShowAddModal(false);
            setAddIncome({ title: '', amount: '', category: '', note: '', created_at: new Date().toISOString().slice(0, 10) });
        }

    }

        const handleDelete = async (id: string) => {
            try {
                const { error } = await supabase
                    .from('transactions')
                    .delete()
                    .eq('id', id); // Correct syntax
        
                if (error) {
                    throw error; // Ensure error is caught
                }
                fetchTransactions();
        
            } catch (error) {
                console.error("Error deleting transaction:", error);
            }
        };

        const handleEditTransaction = async () => {
            if (!selectedTransaction) return;
        
            try {
                const { error } = await supabase
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
              fetchTransactions();
                
        
                handleCloseEditModal(); // Close modal after update
            } catch (error) {
                console.error("Error updating transaction:", error);
            }
        };

        const dateConverter = (date: string) => {
            const newDate = new Date(date);
    
            const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'long', day: 'numeric' };
            const formattedDate = newDate.toLocaleDateString('en-US', options);
    
            return formattedDate;
        }
        
    const fetchTransactions = async () => {
        if (!user) return;
        setLoading(true);

        const {data, error} = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', user.id)
        .eq('type', 'income')
        .order('created_at', {ascending: false});

        if (error) {
            console.error('Error fetching transactions:', error);
        } else {
            setTransaction(data);
            fetchWeeklyIncome(data);
            calculateWeeklyCategoryTrends(data);
        }
        setLoading(false);
    }

    const fetchWeeklyIncome = (transactions: { amount: number; created_at: string }[]) => {
        const currentWeekStart = getCurrentWeekStart();
        let totalAmount = 0;

        transactions.forEach(transaction => {
            const date = new Date(transaction.created_at);
            // Check if the transaction date is within the current week
            if (date >= currentWeekStart && date < new Date(currentWeekStart.getTime() + 7 * 24 * 60 * 60 * 1000)) {
                totalAmount += transaction.amount;
            }
        });

        setWeeklyIncome(totalAmount);
    };

    const getCurrentWeekStart = (): Date => {
        const now = new Date();
        const dayOfWeek = now.getUTCDay(); // Sunday is 0, Monday is 1, ..., Saturday is 6
        const diffToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek; // Adjust for Sunday
        now.setUTCDate(now.getUTCDate() + diffToMonday);
        now.setUTCHours(0, 0, 0, 0); // Set time to midnight for consistency
        return now;
    };

    const calculateWeeklyCategoryTrends = (
        transactions: { amount: number; created_at: string; category: string }[]
    ) => {
        const currentWeekStart = getCurrentWeekStart();
        const categoryTotals: { [key: string]: number } = {};
    
        transactions.forEach(transaction => {
            const date = new Date(transaction.created_at);
            if (date >= currentWeekStart && date < new Date(currentWeekStart.getTime() + 7 * 24 * 60 * 60 * 1000)) {
                if (!categoryTotals[transaction.category]) {
                    categoryTotals[transaction.category] = 0;
                }
                categoryTotals[transaction.category] += transaction.amount;
            }
        });
    
        const labels: string[] = Object.keys(categoryTotals);
        const dataValues: number[] = Object.values(categoryTotals);
    
        setPieChartData({
            labels,
            datasets: [
                {
                    data: dataValues,
                    backgroundColor: ['#FFD0EC', '#81689D', '#ffffff', '#1F2544', '#474F7A'],
                    borderColor: ['#FFD0EC', '#FFD0EC', '#FFD0EC', '#FFD0EC', '#FFD0EC'],
                    borderWidth: 1,
                },
            ],
        });
    };
    
    

    const handleShowAddModal = () => {
        setShowAddModal(true);
    }

    const handleCloseAddModal = () => {
        setShowAddModal(false);
    }

    const handleShowEditModal = (transaction: TransactionType) => {
        setShowEditModal(true);
        setSelectedTransaction(transaction)
    }

    const handleCloseEditModal = () => {
        setShowEditModal(false);
        setSelectedTransaction(null);
    }
    return(
        <Container className='mb-2'>
            <Container fluid className='d-flex justify-content-between align-items-center mb-2 mt-3'>
            <h1 className='custom-font-family-fredoka fw-semibold custom-color-font4 fs-1'>Income</h1>
            <Button className='custom-button fs-3 fw-semibold rounded-pill' onClick={handleShowAddModal}>Add</Button>
            </Container>
            <Container fluid>
                <Row className='g-5'>
                    <Col md={3}>
                    <Row className="custom-height-30">
                        <Container fluid className="h-100 position-relative">
                            {/* Background Image */}
                            <Image 
                                src={Frame2}
                                className="shadow-sm rounded w-100 h-100 position-absolute top-0 start-0"
                                style={{ objectFit: "cover", zIndex: "-1" }}
                            />
                            
                            {/* Text Content Overlay */}
                            <Container 
                                fluid 
                                className="position-absolute top-0 start-0 w-100 h-100 d-flex flex-column justify-content-center align-items-center text-center"
                            >
                                <h5 className="custom-font-color1 custom-font-family fw-semibold fs-5">
                                    Total Income
                                </h5>
                                <h3 className="custom-font-color1 custom-font-family-fredoka fw-semibold fs-3">
                                    ₱ {weeklyIncome}
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
                    {/* Pie Chart */}
                    <Container fluid className='d-flex justify-content-center align-items-center'>
                    <Pie data={pieChartData}  style={{ width: '250px', height: '250px' }}  />
                            
                            </Container>

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
                                            <p className='fs-6 custom-font-color4 my-2 mx-2'>{transaction.created_at ? dateConverter(transaction.created_at) : "No Date Available"}</p>
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
                    <Modal.Title className='custom-font-family-fredoka custom-color-font5 fw-semibold fs-4'>Add Income</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form className='d-grid gap-2'>
                        <Form.Group controlId="formBasicIncome">
                            <Form.Control name='title' value={addIncome.title} onChange={handleChange} className='rounded-pill py-2 px-3 fs-6 custom-color-font5 fw-regular custom-form-input' type='text' placeholder='Title'/>
                        </Form.Group>
                        <Form.Group controlId='formBasicIncome'>
                            <Form.Control name='amount' value={addIncome.amount} onChange={handleChange} className='rounded-pill py-2 px-3 fs-6 custom-color-font5 fw-regular custom-form-input' type='number' placeholder='Amount'/>
                        </Form.Group>
                        
                        <Form.Group controlId='formBasicIncome'>
                            <Form.Select name='category' value={addIncome.category} onChange={handleChange} className='rounded-pill py-2 px-3 fs-6 custom-color-font5 fw-regular custom-form-input'>
                                <option value=''>Select Category</option>
                                <option value='Salary & Wages'>Salary & Wages</option>
                                <option value='Business & Self-Employment'>Business & Self-Employment</option>
                                <option value='Investments & Passive Income'>Investments & Passive Income</option>
                                <option value='Government Assistance'>Government Assistance</option> 
                                <option value='Gifts & Other Income'>Gifts & Other Income</option> 
                            </Form.Select>
                        </Form.Group>
                        <Form.Group controlId='formBasicIncome'>
                            <Form.Control name='note' value={addIncome.note} onChange={handleChange} className='rounded-pill py-2 px-3 fs-6 custom-color-font5 fw-regular custom-form-input' type='textarea' placeholder='Note'/>
                        </Form.Group>
                    </Form>

                </Modal.Body>
                <Modal.Footer>
                    <Button className='rounded-pill w-100 py-2 px-3 fs-6 custom-button5 fw-semibold' onClick={handleAddIncome}>Add</Button>
                </Modal.Footer>
            </Modal>

            <Modal show={showEditModal} onHide={handleCloseEditModal}>
                <Modal.Header closeButton>
                    <Modal.Title className='custom-font-family-fredoka custom-color-font5 fw-semibold fs-4'>Edit Income</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form className='d-grid gap-2'>
                        <Form.Group controlId="formBasicIncome">
                            <Form.Control 
                                className='rounded-pill py-2 px-3 fs-6 custom-color-font5 fw-regular custom-form-input' 
                                type='text' 
                                placeholder='Title' 
                                value={selectedTransaction?.title || ''} 
                                onChange={(e) => 
                                    setSelectedTransaction(prev => prev 
                                        ? { ...prev, title: e.target.value } 
                                        : { title: e.target.value, amount: 0, category: '', note: '', id: '', user_id: null, type: "income", created_at: '' }
                                    )
                                }
                            />
                        </Form.Group>
                        <Form.Group controlId='formBasicIncome'>
                            <Form.Control 
                                className='rounded-pill py-2 px-3 fs-6 custom-color-font5 fw-regular custom-form-input' 
                                type='number' 
                                placeholder='Amount' 
                                value={selectedTransaction?.amount || ''} 
                                onChange={(e) => 
                                    setSelectedTransaction(prev => prev 
                                        ? { ...prev, amount: Number(e.target.value) } 
                                        : { title: '', amount: Number(e.target.value), category: '', note: '', id: '', user_id: null, type: "income", created_at: '' }
                                    )
                                }
                            />
                        </Form.Group>
                        <Form.Group controlId='formBasicIncome'>
                            <Form.Select 
                                className='rounded-pill py-2 px-3 fs-6 custom-color-font5 fw-regular custom-form-input'
                                value={selectedTransaction?.category || ''} 
                                onChange={(e) => 
                                    setSelectedTransaction(prev => prev 
                                        ? { ...prev, category: e.target.value } 
                                        : { title: '', amount: 0, category: e.target.value, note: '', id: '', user_id: null, type: "income", created_at: '' }
                                    )
                                }>
                                    <option value=''>Select Category</option>
                                    <option value='Salary & Wages'>Salary & Wages</option>
                                    <option value='Business & Self-Employment'>Business & Self-Employment</option>
                                    <option value='Investments & Passive Income'>Investments & Passive Income</option>
                                    <option value='Government Assistance'>Government Assistance</option> 
                                    <option value='Gifts & Other Income'>Gifts & Other Income</option> 
                            </Form.Select>
                        </Form.Group>
                        <Form.Group controlId='formBasicIncome'>
                            <Form.Control 
                                className='rounded-pill py-2 px-3 fs-6 custom-color-font5 fw-regular custom-form-input' 
                                type='text' 
                                placeholder='Note' 
                                value={selectedTransaction?.note || ''} 
                                onChange={(e) => 
                            setSelectedTransaction(prev => prev 
                                ? { ...prev, note: e.target.value } 
                                : { title: '', amount: 0, category: '', note: e.target.value, id: '', user_id: null, type: "income", created_at: '' }
                            )
                        }
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