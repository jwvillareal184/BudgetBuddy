import {useState, useEffect} from 'react'
import {Container, Modal, Row, Col, Table, Button, Form, ProgressBar} from 'react-bootstrap'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrash, faEdit} from '@fortawesome/free-solid-svg-icons';
import { useUser } from './UserContext';
import { supabase } from './supabaseClient';

type GoalType = {
    id: number;
    user_id?: string | null; // UUID, can be null
    title: string;
    target_amount: number;
    current_amount: number; // Numeric(10,2) is represented as a number in JavaScript
    note?: string | null; // Nullable text
    created_at?: string | null; // Nullable timestamp (ISO 8601 format as a string)
  };

export default function Goal() {
    const { user} = useUser();
    console.log(user?.email);
    const [showAddModal, setShowAddModal] = useState<boolean>(false);
    const [showEditModal, setShowEditModal] = useState<boolean>(false);
    const [loading, setLoading] = useState<boolean>(true);
    const [goals, setGoal] = useState<GoalType[]>([]);
    const [selectedGoal, setSelectedGoal] = useState<GoalType | null>(null);

    const [addGoal, setAddGoal] = useState({
        title: '',
        target_amount: '',
        current_amount: '',
        note: '',
        created_at: new Date().toISOString().slice(0,10)
    });

    const handleChange= (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const {name, value} = e.target;
        setAddGoal({...addGoal, [name]: value});
    }

    const handleAddGoal = async () => {
        if(!addGoal.title || !addGoal.target_amount || !addGoal.target_amount || !addGoal.current_amount ) {
            alert('Please fill the all the required fields.');
            return;
        }

      
        const user_id = user?.id;

        const {data, error} = await supabase.from('goals').insert([{
            user_id,
            title: addGoal.title,
            target_amount: addGoal.target_amount,
            current_amount: addGoal.current_amount,
            note: addGoal.note,
            created_at: addGoal.created_at
        }]);

        if (error) {
            console.error('Error adding Goal:', error);
            alert('Failed to add Goal.');
        } else {
            console.log('Goal added:', data);
            alert('Goal added successfully!');
            fetchGoals();
            setShowAddModal(false);
            setAddGoal({ title: '', target_amount: '', current_amount: '', note: '', created_at: new Date().toISOString().slice(0, 10) });
        }

    }

    const fetchGoals = async () => {
        if (!user) return;
        setLoading(true);

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
        setLoading(false);
    }

    const handleDelete = async (id: number) => {
        try {
            const { error } = await supabase
                .from('goals')
                .delete()
                .eq('id', id); // Correct syntax
    
            if (error) {
                throw error; // Ensure error is caught
            }
    
            // Update UI by removing the deleted Goal
            setGoal(prev => prev.filter(Goal => Goal.id !== id));
    
        } catch (error) {
            console.error("Error deleting Goal:", error);
        }
    };

    useEffect(() => {
        fetchGoals();
    },[]);

    const handleEditGoal = async () => {
        if (!selectedGoal) return;
    
        try {
            const {  error } = await supabase
                .from("goals")
                .update({
                    title: selectedGoal.title,
                    current_amount: selectedGoal.current_amount,
                    target_amount: selectedGoal.target_amount,
                    note: selectedGoal.note
                })
                .eq("id", selectedGoal.id); // Update where id matches
    
            if (error) throw error;
            alert('Goal updated!');
            // Update UI: Refresh Goals list
           fetchGoals();
            
    
            handleCloseEditModal(); // Close modal after update
        } catch (error) {
            console.error("Error updating Goal:", error);
        }
    };
  

    const handleShowAddModal = () => {
        setShowAddModal(true);
    }

    const handleCloseAddModal = () => {
        setShowAddModal(false);
    }

    const handleShowEditModal = (goal: GoalType) => {
        setShowEditModal(true);
        setSelectedGoal(goal);
    }

    const handleCloseEditModal = () => {
        setShowEditModal(false);
        setSelectedGoal(null);
    }
    return(
        <Container className='mb-2'>
            <Container fluid className='d-flex justify-content-between align-items-center mb-2 mt-3'>
            <h1 className='custom-font-family-fredoka fw-semibold custom-color-font4 fs-1'>Goal</h1>
            <Button className='custom-button fs-3 fw-semibold rounded-pill' onClick={handleShowAddModal}>Add</Button>
            </Container>
            <Container fluid className='table-responsive'>
    
                    <Table hover style={{objectFit: "cover"}} className='100vh'>
                            <tbody>
                            {loading ? (
                                        <tr>
                                            <td>Loading...</td>
                                        </tr>
                                    ) : goals.length > 0 ? (
                                        goals.map((goal) => (
                                            <tr key={goal.id}>
                                                <td className='mt-3 me-3'>
                                                    <Row>
                                                        <h3 className='custom-font-family-fredoka fw-semibold custom-color-font4 fs-3'>{goal.title}</h3>
                                                    </Row>
                                                    <Row className='mx-0 px-0'>
                                                        <Col className='mx-0 px-0 mt-3'>
                                                            <Container fluid style={{ width: '100px', height: '100px' }}>
                                                                <div className="d-flex justify-content-center mt-2">
                                                                    <span className="fw-bold">{goal.current_amount} / {goal.target_amount}</span>
                                                                </div>
                                                                <ProgressBar className="custom-bg-color4 ">
                                                                    {/* Current progress */}
                                                                    <ProgressBar
                                                                        now={(goal.current_amount / goal.target_amount) * 100}
                                                                        label={`${((goal.current_amount / goal.target_amount) * 100).toFixed(1)}%`}
                                                                        key={1}
                                                                        className="custom-bg-color1 custom-color-font4"
                                                                    />
                                                                </ProgressBar>

                                                            </Container>
                                                        </Col>
                                                        <Col className="d-flex justify-content-end align-items-center border-0">
                                                            <div className="button-container">
                                                                <Button className="custom-button rounded-pill" onClick={() => handleShowEditModal(goal)}>
                                                                    <FontAwesomeIcon icon={faEdit} className="fs-2" />
                                                                </Button>
                                                            </div>
                                                            <div className="button-container">
                                                                <Button className="custom-button rounded-pill" onClick={() => handleDelete(goal.id)}>
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
                                            <td>No Goal Recorded</td>
                                        </tr>
                                    )}

                            </tbody>
                        </Table>
              
         
        
            </Container>

            <Modal show={showAddModal} onHide={handleCloseAddModal}>
                <Modal.Header closeButton>
                    <Modal.Title className='custom-font-family-fredoka custom-color-font5 fw-semibold fs-4'>Add Goal</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form className='d-grid gap-2'>
                        <Form.Group controlId="formBasicGoal">
                            <Form.Control name='title' value={addGoal.title} onChange={handleChange} className='rounded-pill py-2 px-3 fs-6 custom-color-font5 fw-regular custom-form-input' type='text' placeholder='Title'/>
                        </Form.Group>
                        <Form.Group controlId='formBasicGoal'>
                            <Form.Control name='target_amount' value={addGoal.target_amount} onChange={handleChange} className='rounded-pill py-2 px-3 fs-6 custom-color-font5 fw-regular custom-form-input' type='number' placeholder='Target Amount'/>
                        </Form.Group>
                        <Form.Group controlId='formBasicGoal'>
                            <Form.Control name='current_amount' value={addGoal.current_amount} onChange={handleChange} className='rounded-pill py-2 px-3 fs-6 custom-color-font5 fw-regular custom-form-input' type='number' placeholder='Current Amount'/>
                        </Form.Group>
                        <Form.Group controlId='formBasicGoal'>
                            <Form.Control name='note' value={addGoal.note} onChange={handleChange} className='rounded-pill py-2 px-3 fs-6 custom-color-font5 fw-regular custom-form-input' type='textarea' placeholder='Note'/>
                        </Form.Group>
                    </Form>

                </Modal.Body>
                <Modal.Footer>
                    <Button className='rounded-pill w-100 py-2 px-3 fs-6 custom-button5 fw-semibold' onClick={handleAddGoal}>Add</Button>
                </Modal.Footer>
            </Modal>

            <Modal show={showEditModal} onHide={handleCloseEditModal}>
    <Modal.Header closeButton>
        <Modal.Title className='custom-font-family-fredoka custom-color-font5 fw-semibold fs-4'>Edit Goal</Modal.Title>
    </Modal.Header>
    <Modal.Body>
    <Form className='d-grid gap-2'>
    {/* Title Field */}
    <Form.Group controlId="formBasicIncome">
        <Form.Control 
            className='rounded-pill py-2 px-3 fs-6 custom-color-font5 fw-regular custom-form-input' 
            name='title'
            type='text' 
            placeholder='Title' 
            value={selectedGoal?.title || ''} 
            onChange={(e) => 
                setSelectedGoal(prev => prev 
                    ? { ...prev, title: e.target.value } 
                    : { id: 0, user_id: null, title: e.target.value, target_amount: 0, current_amount: 0, note: '', created_at: '' }
                )
            }
        />
    </Form.Group>

    {/* Target Amount Field */}
    <Form.Group controlId='formBasicTargetAmount'>
        <Form.Control 
            className='rounded-pill py-2 px-3 fs-6 custom-color-font5 fw-regular custom-form-input' 
            name='target_amount'
            type='number' 
            placeholder='Target Amount' 
            value={selectedGoal?.target_amount || ''} 
            onChange={(e) => 
                setSelectedGoal(prev => prev 
                    ? { ...prev, target_amount: parseFloat(e.target.value) || 0 } 
                    : { id: 0, user_id: null, title: '', target_amount: parseFloat(e.target.value) || 0, current_amount: 0, note: '', created_at: '' }
                )
            }
        />
    </Form.Group>

    {/* Current Amount Field */}
    <Form.Group controlId='formBasicCurrentAmount'>
        <Form.Control 
            className='rounded-pill py-2 px-3 fs-6 custom-color-font5 fw-regular custom-form-input' 
            name='current_amount'
            type='number' 
            placeholder='Current Amount' 
            value={selectedGoal?.current_amount || ''} 
            onChange={(e) => 
                setSelectedGoal(prev => prev 
                    ? { ...prev, current_amount: parseFloat(e.target.value) || 0 } 
                    : { id: 0, user_id: null, title: '', target_amount: 0, current_amount: parseFloat(e.target.value) || 0, note: '', created_at: '' }
                )
            }
        />
    </Form.Group>

    {/* Note Field */}
    <Form.Group controlId='formBasicNote'>
        <Form.Control 
            className='rounded-pill py-2 px-3 fs-6 custom-color-font5 fw-regular custom-form-input' 
            name='note'
            type='text' 
            placeholder='Note' 
            value={selectedGoal?.note || ''} 
            onChange={(e) => 
                setSelectedGoal(prev => prev 
                    ? { ...prev, note: e.target.value } 
                    : { id: 0, user_id: null, title: '', target_amount: 0, current_amount: 0, note: e.target.value, created_at: '' }
                )
            }
        />
    </Form.Group>
</Form>

    </Modal.Body>
    <Modal.Footer>
        <Button className='rounded-pill w-100 py-2 px-3 fs-6 custom-button5 fw-semibold' onClick={handleEditGoal}>Edit</Button>
    </Modal.Footer>
</Modal>

        </Container>
    );
}