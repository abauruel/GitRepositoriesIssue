import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import PropTypes from 'prop-types';
import Container from '../../components/Content';
import { FaArrowRight, FaArrowLeft } from 'react-icons/fa';

import { Owner, Loading, IssueList, ButtonFilter } from './styles';

export default class Repository extends Component {
  static propTyes = {
    match: PropTypes.shape({
      params: PropTypes.shape({
        repository: PropTypes.string,
      }),
    }).isRequired,
  };
  state = {
    repository: {},
    issues: [],
    loading: true,
    filter: ['open', 'closed', 'all'],
    page: 0,
    filterState: null,
  };
  async componentDidMount() {
    const { match } = this.props;
    const reponame = decodeURIComponent(match.params.repository);
    const [repository, issues] = await Promise.all([
      api.get(`/repos/${reponame}`),
      api.get(`/repos/${reponame}/issues`, {
        params: {
          state: 'open',
          per_page: 5,
        },
      }),
    ]);
    this.setState({
      repository: repository.data,
      issues: issues.data,
      loading: false,
    });
  }
  handleFilter = async e => {
    e.preventDefault();
    const { repository } = this.state;
    const name = e.target.name;
    this.setState({ loading: true });

    const response = await api.get(`/repos/${repository.full_name}/issues`, {
      params: {
        state: name,
        per_page: 5,
      },
    });
    this.setState({
      issues: response.data,
      loading: false,
      filterState: name,
    });
  };
  handleNext = async () => {
    const { repository, page, filterState: name } = this.state;
    const response = await api.get(`/repos/${repository.full_name}/issues`, {
      params: {
        state: name,
        per_page: 5,
        page: page + 1,
      },
    });
    if (response) {
      this.setState({
        issues: response.data,
        loading: false,
        page: page + 1,
      });
    }
    console.log(page);
  };
  handlePrevius = async () => {
    const { repository, page, filterState: name } = this.state;
    if (page > 0) {
      const response = await api.get(`/repos/${repository.full_name}/issues`, {
        params: {
          state: name,
          per_page: 5,
          page: page > 0 ? page - 1 : 0,
        },
      });

      this.setState({
        issues: response.data,
        loading: false,
        page: page > 0 ? page - 1 : 0,
      });
    }
    console.log(page);
  };
  render() {
    const { repository, issues, loading, filter, page } = this.state;
    if (loading) {
      return <Loading>Carregando</Loading>;
    }
    return (
      <Container>
        <Owner>
          <Link to="/"> Voltar aos repositorios</Link>
          <img src={repository.owner.avatar_url} alt={repository.owner.login} />
          <h1>{repository.name}</h1>
          <p>{repository.description}</p>

          <div>
            {filter.map(option => (
              <button key={option} name={option} onClick={this.handleFilter}>
                {option}
              </button>
            ))}
          </div>

          <div>
            {page > 0 && (
              <button onClick={this.handlePrevius}>
                <FaArrowLeft /> Anterior
              </button>
            )}
            <button onClick={this.handleNext}>
              Proxima&nbsp;&nbsp;
              <FaArrowRight />
            </button>
          </div>
        </Owner>

        <IssueList>
          {issues.map(issue => (
            <li key={String(issue.id)}>
              <img src={issue.user.avatar_url} alt={issue.user.login} />
              <div>
                <strong>
                  <a href={issue.html_url}>{issue.title}</a>
                  {issue.labels.map(label => (
                    <span key={String(label.id)}>{label.name}</span>
                  ))}
                </strong>
                <p>{issue.user.login}</p>
              </div>
            </li>
          ))}
        </IssueList>
      </Container>
    );
  }
}
