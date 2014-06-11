/** @jsx React.DOM */

var adminui = require('adminui');

var React = require('react');
var UserModel = require('../../models/user');
var api = require('../../request');
var NotesComponent = require('../notes');

var UserProfile = require('./user/profile');
var UserVms = require('./user/vms');
var UserSSHKeys = require('./user/sshkeys');
var UserImages = require('./user/images');
var UserLimits = require('./user/limits/main');
var UserNetworks = require('./user/networks');

var UserForm = require('../../views/user-form');

var PageUser = React.createClass({
    statics: {
        sidebar: 'users',
        url: function(props) {
            var uuid;
            if (props.user) {
                uuid = props.user.get('uuid');
            } else {
                uuid = props.uuid;
            }
            var tab;
            if (props.tab) {
                tab = props.tab;
            } else {
                tab = 'profile';
            }
            return _.str.sprintf('/users/%s/%s', uuid, tab);
        }
    },

    getInitialState: function() {
        var state = {
            tab: this.props.tab || 'profile',
            userModel: this.props.user || new UserModel({uuid: this.props.uuid })
        };
        return state;
    },
    componentWillReceiveProps: function(props) {
        if (props.tab) {
            this.setState({tab: props.tab});
        }

    },

    componentDidMount: function() {
        this.fetchUser();
        this.fetch2fa();
    },

    fetchUser: function() {
        var req = this.state.userModel.fetch();
        req.done(function() {
            this.setState({
                userModel: this.state.userModel
            });
        }.bind(this));
    },

    fetch2fa: function() {
        var url = _.str.sprintf('/api/users/%s/2fa', this.props.uuid);
        api.get(url).end(function(res) {
            if (res.ok) {
                this.setState({'2fa': res.body.enabled});
            }
        }.bind(this));
    },

    getCurrentView: function() {
        var view;
        switch (this.state.tab) {
            case 'profile':
                view = <UserProfile
                    handleModifyUser={this.handleProfileModifyUser}
                    handleToggleTwoFactorAuth={this.handleProfileToggleTwoFactorAuth}
                    twoFactorAuth={this.state['2fa']} userModel={this.state.userModel} />;
                break;

            case 'vms':
                view = <UserVms uuid={this.state.userModel.get('uuid')} />;
                break;

            case 'limits':
                view = <UserLimits
                    readonly={!adminui.user.role('operators')}
                    user={this.state.userModel.get('uuid') } />;
                break;

            case 'sshkeys':
                view = <UserSSHKeys
                    readonly={!adminui.user.role('operators')}
                    user={this.state.userModel.get('uuid') } />;
                break;

            case 'images':
                view = <UserImages
                    readonly={!adminui.user.role('operators')}
                    user={this.state.userModel.get('uuid')} />;
                break;

            case 'networks':
                view = <UserNetworks
                    readonly={!adminui.user.role('operators')}
                    user={this.state.userModel.get('uuid')} />;
                break;
        }

        return view;
    },

    _changeTab: function(t) {
        this.setState({tab: t});
        adminui.router.changeUrl(_.str.sprintf('/users/%s/%s', this.state.userModel.get('uuid'), t ));
    },




    // --- child component handlers
    handleProfileModifyUser: function() {
        var form = new UserForm({user: this.state.userModel});
        form.render();
    },
    handleProfileToggleTwoFactorAuth: function() {
        var self = this;
        var url = '/api/users/'+this.state.userModel.get('uuid') + '/2fa';

        api.get(url).end(function(res) {
            var enabled = !res.body.enabled;

            if (res.ok) {
                api.patch(url).send({enabled: enabled}).end(function() {
                    self.fetch2fa();
                });
            }
        });
    },


    render: function() {
        var user = this.state.userModel.toJSON();
        var currentView = this.getCurrentView();
        var userIconUrl;
        if (user.emailhash) {
            userIconUrl = _.str.sprintf('url(https://www.gravatar.com/avatar/%s?d=identicon&s=65)', user.emailhash);
        } else {
            userIconUrl = '';
        }

        var userIconStyle = { 'background-image': userIconUrl };

        return <div id="page-user">
            <div className="page-header">
                <h1>
                    <div className="user-icon" style={userIconStyle}></div>
                    <span className="cn">{user.cn}</span> <small className="uuid selectable">{user.uuid}</small>
                </h1>
            </div>

            <div className="actions">
                <div className="notes-component-container"><NotesComponent item={this.props.uuid} /></div>
            </div>

            <div className="row">
                <div className="col-sm-2 user-menu">
                    <ul className="nav nav-pills nav-stacked">
                        <li className={this.state.tab === 'profile' ? 'active' : ''}><a onClick={this._changeTab.bind(null, 'profile')}>
                            <i className="fa fa-user fa-fw"></i> Profile</a>
                        </li>
                        <li className={this.state.tab === 'vms' ? 'active' : ''}>
                            <a onClick={this._changeTab.bind(null, 'vms')}><i className="fa fa-fw fa-cubes"></i> Virtual Machines</a>
                        </li>
                        <li className={this.state.tab === 'sshkeys' ? 'active' : ''}>
                            <a onClick={this._changeTab.bind(null, 'sshkeys')}><i className="fa fa-key fa-fw" /> SSH Keys</a>
                        </li>
                        <li className={this.state.tab === 'images' ? 'active' : ''}>
                            <a onClick={this._changeTab.bind(null, 'images')}><i className="fa fa-image fa-fw" /> Images</a>
                        </li>
                        <li className={this.state.tab === 'limits' ? 'active' : ''}>
                            <a onClick={this._changeTab.bind(null, 'limits')}><i className="fa fa-fw fa-hand-o-right"></i> Limits</a>
                        </li>
                        <li className={this.state.tab === 'networks' ? 'active' : ''}>
                            <a onClick={this._changeTab.bind(null, 'networks')}><i className="fa fa-fw fa-hand-o-right"></i> Networks</a>
                        </li>
                        {/* <li className={this.state.tab === 'subusers' ? 'active' : ''}>
                        <a onClick={this._changeTab.bind(null, 'subusers')}>Sub Users</a>
                        </li> */}
                    </ul>
                </div>

                <div className="col-sm-10 user-content">{currentView}</div>
            </div>
        </div>;
    }
});

module.exports = PageUser;