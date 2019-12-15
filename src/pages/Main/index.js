import React, { Component } from 'react';
import { FaGitAlt, FaPlus, FaSpinner } from 'react-icons/fa';
import Container from '../../components/Content';
import { Form, SubmitButton, List } from './styles';
import { Link } from 'react-router-dom';

import api from '../../services/api';
export default class Main extends Component {
  state = {
    newRepo: '',
    repositories: [],
    loading: false,
    fail: false,
  };
  componentDidMount() {
    //localStorage.removeItem('repositories');
    const repositories = localStorage.getItem('repositories');
    if (repositories) {
      this.setState({
        repositories: JSON.parse(repositories),
      });
    }
  }
  componentDidUpdate(_, prevState) {
    const { repositories } = this.state;
    if (prevState.repositories !== repositories) {
      localStorage.setItem('repositories', JSON.stringify(repositories));
    }
  }
  handleInputChange = e => {
    this.setState({
      newRepo: e.target.value,
      fail: false,
    });
  };
  handleSubmit = async e => {
    const { newRepo, repositories } = this.state;
    e.preventDefault();
    this.setState({
      loading: true,
    });
    try {
      const response = await api.get(`/repos/${newRepo}`);

      if (repositories.find(r => r.name === response.data.full_name)) {
        throw new Error('Repositório duplicado');
      }

      const data = {
        name: response.data.full_name,
      };
      this.setState({
        repositories: [...repositories, data],
        newRepo: '',
        loading: false,
      });
    } catch (err) {
      this.setState({
        loading: false,
        fail: true,
      });
    }
  };
  render() {
    const { newRepo, loading, repositories, fail } = this.state;
    return (
      <Container>
        <h1>
          <FaGitAlt />
          Repositorios
        </h1>
        <Form onSubmit={this.handleSubmit} fail={fail ? 1 : 0}>
          <input
            type="text"
            placeholder="Adicionar repositorio"
            value={newRepo}
            onChange={this.handleInputChange}
          />
          <SubmitButton loading={loading ? 1 : 0}>
            {loading ? (
              <FaSpinner color="#fff" size={14} />
            ) : (
              <FaPlus color="#FFF" size={14} />
            )}
          </SubmitButton>
        </Form>
        <List>
          {repositories.map(repository => (
            <li key={repository.name}>
              <span>{repository.name}</span>
              <Link to={`/repository/${encodeURIComponent(repository.name)}`}>
                Detalhes
              </Link>
            </li>
          ))}
        </List>
      </Container>
    );
  }
}
