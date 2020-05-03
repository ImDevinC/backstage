/*
 * Copyright 2020 Devin Collins
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import React, { FC } from 'react';
import { useAsync } from 'react-use';
import { Progress } from '@backstage/core';
import Alert from '@material-ui/lab/Alert';
import { makeStyles } from '@material-ui/core/styles';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';

const JenkinsRootURL = 'http://devin-arch:8080';
// const JenkinsUsername = 'admin';
// const JenkinsPassword = '1234';

const useStyles = makeStyles({
  table: {
    minWidth: 650,
  },
  avatar: {
    height: 32,
    width: 32,
    borderRadius: '50%',
  },
});

type JenkinsJob = {
  _class: string;
  name: string;
  fullDisplayName: string;
  url: string;
  jobs: JenkinsJob[];
  buildable: boolean;
};

type DenseTableProps = {
  jobs: JenkinsJob[];
};

export const DenseTable: FC<DenseTableProps> = ({ jobs }) => {
  const classes = useStyles();

  return (
    <TableContainer>
      <Table
        className={classes.table}
        size="small"
        aria-label="Jenkins Job List"
      >
        <TableHead>
          <TableRow>
            <TableCell>Job</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {jobs.map((job) => (
            <TableRow key={job.url}>
              <TableCell>{job.fullDisplayName}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

const JenkinsFetchJobComponent: FC<{}> = () => {
  const { value, loading, error } = useAsync(async (): Promise<
    JenkinsJob[]
  > => {
    // const response = await fetch(JenkinsRootURL + '/api/json?tree=jobs[name,jobs,url[name,jobs,url]]');
    const response = await fetch(JenkinsRootURL + '/api/json?depth=2');
    const data = await response.json();
    const jobs: JenkinsJob[] = parseJobs(data.jobs);
    return jobs.sort();
  }, []);

  if (loading) {
    return <Progress />;
  } else if (error) {
    console.log(error);
    return <Alert severity="error">{error.message}</Alert>;
  }

  return <DenseTable jobs={value || []} />;
};

const parseJobs = (jobs: JenkinsJob[]) => {
  const returnJobs: JenkinsJob[] = [];
  jobs.forEach((job) => {
    if (job.buildable && job.url && job.fullDisplayName) {
      returnJobs.push(job);
    }
    if (job.jobs) {
      const subJobs = parseJobs(job.jobs);
      subJobs.forEach((j) => returnJobs.push(j));
    }
  });
  return returnJobs;
};

export default JenkinsFetchJobComponent;
