import * as React from "react";
import { Helmet } from "react-helmet";
import * as AuthStore from "../store/Auth";
import { connect } from "react-redux";
import { ApplicationState } from '../store';
import { withRouter } from "react-router";
import { busyGif } from '../img';
import { fetchData, postQuery, putQuery, deleteData } from '../utils';
import { Table, Input, Button, Select, Form, Row, message, Col, Modal, Popconfirm, Tooltip, InputNumber, Cascader, Checkbox, AutoComplete, Switch } from 'antd';
import { FormInstance } from 'antd/lib/form';
import { EditOutlined, DeleteOutlined, QuestionCircleOutlined, PlusCircleOutlined, ReloadOutlined } from '@ant-design/icons';
const { Option } = Select;
const { Item } = Form;


type AppProps =
    AuthStore.AuthState // ... state we've requested from the Redux store
    & typeof AuthStore.actionCreators // ... plus action creators we've requested

//define applicant interface 
interface Applicant
{
    id: number;
    name: string;
    familyName: string;
    address: string;
    emailAdress: string;
    countryOfOrigin: string;
    hired: boolean;
    age: number;
    [key: string]: Applicant[keyof Applicant]; // for dynamically updating any of these properties
}

class Applicants extends React.Component<AppProps>
{
    public state =
        {
            buttonText: 'Add Applicant',
            data: [],
            countries: [],            
            display: false,
            disable: true,
            pagination:
            {
                current: 1,
                total: 0,
                pageSize: 10,
                sorter: {
                    field: "name",
                    order: "asc"
                }
            },
            userId: 0,
            loading: false,
            confirmLoading: false,
            title: 'New Applicant',       
            applicant: { id: 0, name: '', familyName: '', address: '', emailAdress: '', countryOfOrigin: '', hired: false, age: 0 },
            searchText: "",
            visible: false,
            selected: false
        };          

    formRef = React.createRef<FormInstance>();

    async componentDidMount()
    {   
        //fetch applicants list when component is mounted
        const { pagination } = this.state;
        this.getItems({
            results: pagination.pageSize,
            searchText: this.state.searchText,
            page: pagination.current,
            sortField: pagination.sorter.field,
            sortOrder: pagination.sorter.order
        });      
    }

    async getCountries(url)
    {
        return fetch(url).then(data => data.json());
    }

    async UNSAFE_componentWillMount()
    {
        let applicant: Applicant = { id: 0, name: '', familyName: '', address: '', emailAdress: '', countryOfOrigin: '', hired: false, age: 0 };
        this.setState({ applicant: applicant });

        //fetch all countries from the restcountries api and use the result to populate a dropdown so that Applicants' country doesn't 
        //have to be manually entered as text
        let countries = await this.getCountries(`https://restcountries.eu/rest/v2/all`); 
        this.setState({ countries: countries });
    }


    //Trigger the modal dialog and populate it with the selected Applicant's data for updates
    edit(data: any, row: any)
    {
        let el = this;
        el.setState({ visible: true, title: 'Update Applicant', buttonText: 'Update', applicant: data });

        //populate form with edit data selected from index table
        setTimeout(function ()
        {
            el.reset();

            el.formRef.current?.setFieldsValue({               
                name: data.name ? data.name : '',
                familyName: data.familyName ? data.familyName : '',
                address: data.address ? data.address : '',
                emailAdress: data.emailAdress? data.emailAdress : '',
                countryOfOrigin: data.countryOfOrigin? data.countryOfOrigin : '',
                hired: data.hired,
                age: data.age,
            });

            //determine if Submit button should be enabled based on the available fields
            el.determineState();

            //make the Reset button visible
            if (!el.state.display) el.setState({ display: true });

        }, 100);
    }

    //trigger the modal form to add new Applicant
    add()
    {
        this.setState({ visible: true, title: 'Add Applicant', buttonText: 'Add', applicant: { id: 0, name: '', familyName: '', address: '', emailAdress: '', countryOfOrigin: '', hired: false, age: 0 } });
        let el = this;
        setTimeout(function ()
        {
            el.reset();

        }, 100);
    }

    async delete(data: any, row: any)
    {
        let el = this;
        var query = `/api/Applicants/deleteApplicant?applicantId=${row.id}`;

        el.setState({ loading: true });
        let res = await deleteData(query);
        el.setState({ loading: false });

        if (res.code > 0)
        {
            //show success message from server
            message.success(res.message);

            //refresh the applicants list after new addition or an update was successfully made
            const { pagination } = this.state;
            let params = {
                results: pagination.pageSize,
                searchText: this.state.searchText,
                page: pagination.current
            };
            this.getItems(params);

        }
        else
        {
            message.error('Applicant information could not be retrieved');
        }
    }
    
    handleTableChange(pagination: any, filters: any, sorter: any)
    {
        const pager = this.state.pagination;
        pager.current = pagination.current;

        this.setState({
            pagination: pager
        });
        this.getItems({
            results: pager.pageSize,
            searchText: this.state.searchText,
            page: pager.current,
            sortField: pager.sorter.field,
            sortOrder: pager.sorter.order
        });
    }  

    async getItems(params: any) 
    {        
        var searchText = params.searchText;
        var results = params.results;
        var page = params.page;
        let el = this;
        
        var query = `/api/Applicants/getApplicants?itemsPerPage=${results}&pageNumber=${page}&searchText=${searchText}`;
       
        el.setState({loading: true});
        
        let res = await fetchData(query);

        el.setState({loading: false});

        if (res.applicants.length > 0)
        {
            const { pagination } = el.state;
            pagination.total = res.totalItems;           
            el.setState({
                data: res.applicants,
                pagination
            });
        }

        //for searching
        if (searchText && searchText.trim().length > 0)
        {
            const reg = new RegExp(searchText, 'gi');
            this.setState({
                filtered: !!searchText,
                data: this.state.data.map((record: any) =>
                {
                    //search applicant with name, familyname or emailaddress
                    const match = record.name.toString().match(reg) || record.familyName.toString().match(reg) || record.emailAdress.toString().match(reg);

                    if (!match)
                    {
                        return null;
                    }
                    return {
                        ...record,
                        name: (<span> {record.name.split(reg).map((text: any, i: any) => (i > 0 ? [<span key={record.id} className="highlight">{match[0]}</span>, text] : text
                        ))}
                        </span>
                        )
                    };
                }).filter(record => !!record)
            });
        }
    }

    //handle table change such as clicking the pagination buttons
    handleChange(value: any)
    {
        const { pagination } = this.state;
        pagination.pageSize = parseInt(value);

        this.setState({
            pagination: pagination
        });

        this.getItems({
            results: pagination.pageSize,
            searchText: this.state.searchText,
            page: pagination.current
        });
    }

    //handle changing the number of items to be displayed per page
    onInputChange(e: any)
    {
        let searchTerm = e.target.value.trim();
        this.setState({searchText: searchTerm});
        const { pagination } = this.state;
        this.getItems({
            results: pagination.pageSize,
            searchText: searchTerm,
            page: pagination.current
        });
    }

    //handle the search events generated from the search textbox
    onSearch()
    {
        const { pagination } = this.state;
        this.getItems({
            results: pagination.pageSize,
            searchText: this.state.searchText,
            page: pagination.current
        });
    }

    async getApplicant(row: any)
    {
        let el = this;

        var query = `/api/Applicants/getApplicant?applicantId=${row.id}`;

        el.setState({ loading: true });

        let applicant = await fetchData(query);
        el.setState({ loading: false });
      
        if (applicant.id > 0)
        {          
            el.setState({
                applicant: applicant,
                visible: true
            });
        }
        else
        {
            message.error('Applicant information could not be retrieved');
        }
    }

    async process(applicant: any)
    {
        console.log(applicant.countryOfOrigin);
        if (!applicant.name)
        {
            message.error("Please provide Applicant's Name");
            return;
        }
        if (!applicant.familyName)
        {
            message.error("Please provide Applicant's Family name");
            return;
        }
        if (!applicant.countryOfOrigin || !applicant.countryOfOrigin)
        {
            message.error("Please select Applicant's Country Of Origin");
            return;
        }
        if (applicant.age < 20 || applicant.age > 60)
        {
            message.error("Applicant's Age must fall between 20 and 60 years");
            return;
        }

        if (!applicant.emailAdress)
        {
            message.error("Please provide Applicant's Email");
            return;
        }

        //basic email validation. A more robust validation will happen at the back end 
        if (applicant.emailAdress.indexOf('@') === -1 || applicant.emailAdress.indexOf('.') === -1)
        {
            message.error("The provided Email Address is invalid.");
            return;
        }

        let url = '';

        let res: any = {};
        this.setState({ confirmLoading: true });

        if (!this.state.applicant.id || this.state.applicant.id < 1)
        {
            //post request is required
            url = '/api/Applicants/addApplicant';
            res = await postQuery(url, JSON.stringify({                
                name: applicant.name,
                familyName: applicant.familyName,
                address: applicant.address,
                emailAdress: applicant.emailAdress,
                countryOfOrigin: applicant.countryOfOrigin,
                hired: applicant.hired,
                age: applicant.age
            }));
        }
        else 
        {
            //put request is required
            url = '/api/Applicants/updateApplicant';
            res = await putQuery(url, JSON.stringify({
                id: this.state.applicant.id,
                name: applicant.name,
                familyName: applicant.familyName,
                address: applicant.address,
                emailAdress: applicant.emailAdress,
                countryOfOrigin: applicant.countryOfOrigin,
                hired: applicant.hired,
                age: applicant.age
            }));
        }      

        this.setState({ confirmLoading: false });

        if (res.code > 0)
        {
             //refresh the applicants list after new addition or an update was successfully made
            const { pagination } = this.state;
            let params = {
                results: pagination.pageSize,
                searchText: this.state.searchText,
                page: pagination.current
            };

            this.getItems(params);
            this.setState({ visible: false }); //close modal form
            message.success(res.message);
        }
        else
        {
           message.error(res.message); //show error message from server and leave modal form open
        }
    }

    //close modal form
    exit()
    {
        this.setState({
            visible: false
        });
    }

    reset()
    {        
        //clear form fields
        this.formRef.current?.resetFields();
        //disable Submit button
        if (!this.state.disable) this.setState({ disable: true });
        //hide reset button
        this.setState({ display: false });
    }

    //dynamically handle property selection from dropdown select
    handleSelectChange(feature: any, value: any, target: any) 
    {
        let applicant: any = this.state.applicant;
        applicant[feature] = value[target];
        this.setState({applicant});
    }

    //dynamically handle property update from text inputs
    textChange(feature: string, e: any)
    {        
        let applicant: Applicant = this.state.applicant;        
        applicant[feature] = e?.target? e.target.value : e;
        this.setState({ applicant });
    }

    determineState()
    {
        let el = this;
        //use this function to determine if the submit button should be enabled or disabled based on the form's validation outcome
        var fieldValue = el.formRef.current?.getFieldsValue();

        var isprovided = Object.values(fieldValue)?.some(o => o !== undefined);
        if (isprovided) {
            if (!el.state.display) el.setState({ display: true });
        }
        else {
            if (el.state.display) el.setState({ display: false });
        }

        //use this to determine if the reset button should be visible or not is some value is entered in any of the form fields
        var vll: any[] = el.formRef.current?.getFieldsError();
        var isAllprovided = Object.values(fieldValue)?.every(o => o !== undefined);
          
        if (vll.every(e => e.errors.length < 1) && isAllprovided)
        {
            if (el.state.disable) el.setState({ disable: false });
        }
        else
        {
            if (!el.state.disable) el.setState({ disable: true });
        }
    }

    render() 
    {
        let el = this;
        const { searchText, selected, applicant, confirmLoading, buttonText, visible, title, countries, display, disable } = el.state;

        //Prepare table columns for the Applicants list
        const columns =
            [
                {
                    title: 'Name',
                    dataIndex: 'name',
                    key: 'name'
                },
                {
                    title: 'Family name',
                    dataIndex: 'familyName',
                    key: 'familyName'
                },
                {
                    title: 'Age (Years)',
                    dataIndex: 'age',
                    key: 'age'
                },
                {
                    title: 'Email Address',
                    dataIndex: 'emailAdress',
                    key: 'emailAdress'
                },
                {
                    title: 'Hired',
                    dataIndex: 'hired',
                    key: 'hired',
                    render: (value: any, row: any, index: any) => <span key={value.id}>
                        {row.hired === true? 'Yes' : 'No'}
                    </span>
                },
                {
                    title: 'Address',
                    dataIndex: 'address',
                    key: 'address'
                },
                {
                    title: 'Country of Origin',
                    dataIndex: 'countryOfOrigin',
                    key: 'countryOfOrigin'
                },
                {
                    title: 'Action',
                    dataIndex: '', key: 'x',
                    render: (value: any, row: any, index: any) =>
                        <span key={value.id}>
                            <a title="update" onClick={() => this.edit(value, row)} style={{ cursor: 'pointer' }}><EditOutlined /></a> &nbsp;
                            <Popconfirm placement="top" title='Are you sure to delete this Applicant?' onConfirm={() => this.delete(value, row)} okText="Yes" cancelText="No">
                                <DeleteOutlined />
                            </Popconfirm>
                        </span>
                }
            ];         

            const formItemLayout = {
                labelCol: {
                    xs: { span: 24 },
                    sm: { span: 8 },
                },
                wrapperCol: {
                    xs: { span: 24 },
                    sm: { span: 16 },
                },
            };
            const tailFormItemLayout = {
                wrapperCol: {
                    xs: {
                        span: 24,
                        offset: 0,
                    },
                    sm: {
                        span: 16,
                        offset: 8,
                    },
                },
            };
                  
        return (
            <div style={{marginTop: '15px', padding: '20px'}}>
                <Helmet>
                    <title>Hahn - Applicants</title>
                </Helmet>
                <img className="waiter2" src={busyGif} alt="" style={{ width: '54px', height: '54px', display: confirmLoading ? 'block' : 'none' }} />  
                <div style={{display: selected? 'none':'block'}}>
                    <div className="custom-filter-dropdown">
                        <Row style={{ marginTop: '2px' }}>
                            <Col span={24}>
                                <h4 style={{fontWeight: 'bold', fontSize: '18px'}}>Applicants</h4>
                            </Col>
                        </Row>
                        <Row gutter={2} style={{ marginTop: '10px' }}>
                            <Col xs={24} sm={24} md={6} lg={6}>
                                <Select defaultValue="10" id="pageSize" onChange={el.handleChange} style={{ width: '100%' }}>
                                    <Option value="10">10</Option>
                                    <Option value="25">25</Option>
                                    <Option value="50">50</Option>
                                    <Option value="100">100</Option>
                                </Select>
                            </Col>
                            <Col xs={8} sm={8} md={6} lg={6} style={{ paddingLeft: '10px' }}>
                                <Input className="ant-input-lg-2" style={{ width: '100%' }} placeholder="Search..." value={searchText} onChange={(e) => el.onInputChange(e)} onPressEnter={el.onSearch} />
                            </Col>
                            <Col xs={6} sm={6} md={10} lg={10} style={{ paddingLeft: '10px' }}>                           
                                <Button icon={<PlusCircleOutlined />} disabled={confirmLoading} className="login-button" id="push-btn" loading={confirmLoading} key="submit" type="primary" size="large" onClick={() => el.add()} style={{ paddingRight: '40px', paddingLeft: '40px', float: 'right' }}>
                                    <span id="buttonText">Add Applicant</span>
                                </Button>
                            </Col>
                        </Row>
                        <br />
                        <Table columns={columns} rowKey={record => record.id} dataSource={el.state.data} pagination={el.state.pagination} loading={el.state.loading} onChange={(a: any, b: any, c: any) => el.handleTableChange(a, b, c)} bordered/>                       
                    </div>
                    <div className="md-wrapper">
                        <Modal className="modal-width-500"
                            visible={visible}
                            title={title}
                            maskClosable={false}
                            onCancel={() => el.exit()}
                            footer={null}
                           >
                            <Form id="applicantsForm" onFinish={(values) => el.process(values)} {...formItemLayout} ref={el.formRef} onClick={() => this.determineState()} onBlur={() => this.determineState()} onKeyUp={() => this.determineState()}>
                                <div className='ant-row'>
                                    <div className='ant-col-24 padding-md'>

                                        <Item
                                            name="name"
                                            label={
                                                <span>
                                                    Name&nbsp;
                                                    <Tooltip title="Applicant's First Name">
                                                        <QuestionCircleOutlined />
                                                    </Tooltip>
                                                </span>
                                            }
                                            rules={[{
                                                type: 'string',
                                                message: "Applicant's Name must not be less than 5 characters",
                                                min: 5,
                                            }, { required: true, message: "Please provide Aplicant's First Name", whitespace: true }]}
                                        >
                                            <Input  className="ant-input ant-input-lg input-no-border" />
                                        </Item>
                                        
                                        <Item
                                            name="familyName"
                                            label={
                                                <span>
                                                    Family Name&nbsp;
                                                    <Tooltip title="Applicant's Last Name">
                                                        <QuestionCircleOutlined />
                                                    </Tooltip>
                                                </span>
                                            }
                                            rules={[{
                                                type: 'string',
                                                message: "Applicant's Family Name must not be less than 5 characters",
                                                min: 5,
                                            }, { required: true, message: "Please provide Aplicant's Last Name", whitespace: true }]}
                                        >
                                            <Input className="ant-input ant-input-lg input-no-border" />
                                        </Item>
                                     
                                        <Item name="emailAdress" label="Email Address"
                                            rules={[
                                                {
                                                    type: 'email',
                                                    message: 'Invalid Email Address',
                                                },
                                                {
                                                    required: true,
                                                    message: "Please provide Applicant's Email Address",
                                                },
                                            ]}
                                        >
                                            <Input className="ant-input ant-input-lg input-no-border" />
                                        </Item>

                                        <Item name="age" label="Age"
                                            rules={[
                                                {
                                                    type: 'integer',
                                                    message: 'Age must fall between 20 and 60 years',
                                                    min: 20,
                                                    max: 60
                                                },
                                                {
                                                    required: true,
                                                    message: "Please provide Applicant's Age",
                                                },
                                            ]}
                                        >
                                            <InputNumber min={20} max={60} className="ant-input ant-input-lg input-no-border"/>
                                        </Item>

                                        <Item name="address" label="Address"
                                            rules={[
                                                {
                                                    type: 'string',
                                                    message: 'Address must not be less than 10 characters',
                                                    min: 10
                                                },
                                                {
                                                    required: true,
                                                    message: "Please provide Applicant's Address",
                                                },
                                            ]}
                                        >
                                            <Input className="ant-input ant-input-lg input-no-border"/>
                                        </Item>

                                        <Item name="countryOfOrigin" label="Country of Origin"
                                            rules={[                                               
                                                {
                                                    required: true,
                                                    message: "Please select Applicant's Country of Origin",
                                                },
                                            ]}
                                        >
                                            <Select                                                
                                                style={{ width: '100%' }}
                                                showSearch
                                                placeholder="-- Select Country of Origin --"
                                                optionFilterProp="value"
                                                filterOption={(input, option) =>
                                                    option.value.toLowerCase().indexOf(input.toLowerCase()) >= 0
                                                }
                                            >
                                                <Option value="">-- Select Country --</Option>
                                                {countries && countries.map((s: any) => <Option key={s.name} value={s.name}>{<img style={{ width: '30px', height: '20px', paddingRight: '5px' }} src={s.flag} />}{s.name}</Option>)}
                                            </Select>
                                        </Item>
                                        <Item name="hired" label="Hire Applicant" className="less-margin"
                                            valuePropName="checked"
                                        >
                                            <Switch
                                                checkedChildren='YES'
                                                unCheckedChildren='NO'
                                                defaultChecked={false}
                                            />
                                        </Item>
                                        <Item {...tailFormItemLayout} className="ant-modal-footer less-margin">  
                                            <Row>
                                                <Col span={12}>                                               
                                                    <Button type="primary" htmlType="submit" size="large" style={{ float: 'right', paddingRight: '40px', paddingLeft: '40px' }} disabled={confirmLoading || disable}>
                                                        Submit
                                                    </Button>
                                                </Col>
                                                <Col span={12}>

                                                    <Popconfirm placement="top" title='Are you sure to reset all fields?' onConfirm={() => this.reset()} okText="Yes" cancelText="No">
                                                        <Button type="default" disabled={confirmLoading} className="login-button reset" size="large" style={{ marginLeft: '8px', paddingRight: '40px', paddingLeft: '40px', float: 'right', display: display ? 'block' : 'none' }} >
                                                            <ReloadOutlined /> Reset
                                                    </Button>
                                                    </Popconfirm>                                                    
                                                </Col>
                                           </Row>
                                        </Item>
                                    </div>
                                </div>
                            </Form>
                        </Modal>
                    </div>
            </div>              
        </div>
    )}
}

var component = connect(
    (state: ApplicationState) => state.auth, // Selects which state properties are merged into the component's props
    AuthStore.actionCreators // Selects which action creators are merged into the component's props
)(Applicants as any);

// @ts-ignore
export default (withRouter(component));

