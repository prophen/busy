import React from 'react';
import PropTypes from 'prop-types';
import { Modal, Form, Input } from 'antd';
import _ from 'lodash';
import { connect } from 'react-redux';
import { injectIntl, FormattedMessage } from 'react-intl';
import Action from '../components/Button/Action';
import SteemConnect from '../steemConnectAPI';
import { getAuthenticatedUser } from '../reducers';
import transferFormValidations from './transferFormValidations';
import './WalletAction.less';

@transferFormValidations
@injectIntl
@Form.create()
@connect(state => ({
  user: getAuthenticatedUser(state),
}))
class PowerUpButton extends React.Component {
  static propTypes = {
    intl: PropTypes.shape(),
    amountRegex: PropTypes.shape(),
    form: PropTypes.shape(),
    user: PropTypes.shape(),
    validateSteemBalance: PropTypes.func,
    validateUsername: PropTypes.func,
  };

  static defaultProps = {
    intl: {},
    amountRegex: /^[0-9]*\.?[0-9]{0,3}$/,
    form: {},
    user: {},
    validateSteemBalance: () => {},
    validateUsername: () => {},
  };

  constructor(props) {
    super(props);

    this.state = {
      displayModal: false,
      amount: '',
    };

    this.displayModal = this.displayModal.bind(this);
    this.hideModal = this.hideModal.bind(this);
    this.handleContinueClick = this.handleContinueClick.bind(this);
    this.handleBalanceClick = this.handleBalanceClick.bind(this);
    this.handleAmountChange = this.handleAmountChange.bind(this);
  }

  displayModal() {
    this.setState({
      displayModal: true,
    });
  }

  hideModal() {
    this.setState({
      displayModal: false,
    });
  }

  handleContinueClick() {
    const { form, user } = this.props;
    form.validateFields({ force: true }, (errors, values) => {
      if (!errors) {
        const transferQuery = {
          to: user.name,
          amount: values.amount,
        };

        if (values.memo) transferQuery.memo = values.memo;

        const win = window.open(SteemConnect.sign('transfer_to_vesting', transferQuery), '_blank');
        win.focus();
        this.hideModal();
      }
    });
  }

  handleBalanceClick(event) {
    const { oldAmount } = this.state;
    const value = parseFloat(event.currentTarget.innerText);
    this.setState({
      amount: this.props.amountRegex.test(value) ? value : oldAmount,
    });
    this.props.form.setFieldsValue({
      amount: value,
    });
  }

  handleAmountChange(event) {
    const { value } = event.target;
    const { amount } = this.state;

    this.setState({
      amount: this.props.amountRegex.test(value) ? value : amount,
    });
    this.props.form.setFieldsValue({
      amount: this.props.amountRegex.test(value) ? value : amount,
    });
    this.props.form.validateFields(['amount']);
  }

  renderTo() {
    const { intl, form } = this.props;
    const { getFieldDecorator } = form;
    return (
      <Form.Item label={<FormattedMessage id="to" defaultMessage="To" />}>
        {getFieldDecorator('to', {
          rules: [
            {
              required: true,
              message: intl.formatMessage({
                id: 'to_error_empty',
                defaultMessage: 'Recipient is required.',
              }),
            },
            { validator: this.props.validateUsername },
          ],
        })(
          <Input
            type="text"
            placeholder={intl.formatMessage({
              id: 'to_placeholder',
              defaultMessage: 'Payment recipient',
            })}
          />,
        )}
      </Form.Item>
    );
  }

  render() {
    const { intl, form, user } = this.props;
    const { getFieldDecorator } = form;
    const { displayModal } = this.state;
    const balance = _.get(user, 'balance', 0);

    return (
      <div className="WalletAction">
        <Action
          className="WalletAction"
          primary
          text={intl.formatMessage({ id: 'power_up', defaultMessage: 'Power up' })}
          onClick={this.displayModal}
        />
        {displayModal && (
          <Modal
            visible={displayModal}
            title={intl.formatMessage({
              id: 'power_up_title',
              defaultMessage: 'Convert to steem power',
            })}
            okText={intl.formatMessage({ id: 'power_up', defaultMessage: 'Power up' })}
            cancelText={intl.formatMessage({ id: 'cancel', defaultMessage: 'Cancel' })}
            onOk={this.handleContinueClick}
            onCancel={this.hideModal}
            destroyOnClose
          >
            <Form hideRequiredMark>
              <p>
                <FormattedMessage
                  id="power_up_description"
                  defaultMessage="Convert your steem to steem power to earn more curation rewards."
                />
              </p>
              <br />
              <p>
                <FormattedMessage
                  id="power_up_warning"
                  defaultMessage="When you convert to steem power, it requires 3 months (13 payments) to convert back to steem."
                />
              </p>
              <Form.Item label={<FormattedMessage id="amount" defaultMessage="Amount" />}>
                {getFieldDecorator('amount', {
                  trigger: '',
                  rules: [
                    {
                      required: true,
                      message: intl.formatMessage({
                        id: 'amount_error_empty',
                        defaultMessage: 'Amount is required.',
                      }),
                    },
                    {
                      pattern: this.props.amountRegex,
                      message: intl.formatMessage({
                        id: 'amount_error_format',
                        defaultMessage:
                          'Incorrect format. Use comma or dot as decimal separator. Use at most 3 decimal places.',
                      }),
                    },
                    { validator: this.props.validateSteemBalance },
                  ],
                })(
                  <Input
                    onChange={this.handleAmountChange}
                    placeholder={intl.formatMessage({
                      id: 'amount_placeholder',
                      defaultMessage: 'How much do you want to send',
                    })}
                  />,
                )}
                <FormattedMessage
                  id="balance_amount"
                  defaultMessage="Your balance: {amount}"
                  values={{
                    amount: (
                      <a role="presentation" onClick={this.handleBalanceClick}>
                        {balance}
                      </a>
                    ),
                  }}
                />
              </Form.Item>
            </Form>
          </Modal>
        )}
      </div>
    );
  }
}

export default PowerUpButton;