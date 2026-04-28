const app = angular.module('studentApp', []);

app.controller('MainController', function($scope, $http, $timeout) {
    // State
    $scope.activeTab = 'home';
    $scope.students = [];
    $scope.darkMode = false;
    $scope.searchQuery = '';
    $scope.branchFilter = '';
    $scope.toastMessage = '';
    
    $scope.branches = ['Computer Science', 'Electronics', 'Mechanical', 'Civil', 'Information Science', 'Electrical'];
    $scope.semesters = ['1', '2', '3', '4', '5', '6', '7', '8'];

    // Stats
    $scope.stats = {
        totalStudents: 0,
        totalBranches: 0,
        avgSemester: 0,
        maxSemester: 0,
        minSemester: 0
    };

    // Modal State
    $scope.isEditing = false;
    $scope.currentStudent = {};

    // Handle Photo Upload
    $scope.handlePhotoUpload = function(input) {
        if (input.files && input.files[0]) {
            const reader = new FileReader();
            reader.onload = function(e) {
                $scope.$apply(function() {
                    $scope.currentStudent.photo = e.target.result;
                });
            };
            reader.readAsDataURL(input.files[0]);
        }
    };

    // Initialize
    $scope.init = function() {
        $scope.fetchStudents();
        
        // Sidebar toggle
        const el = document.getElementById("wrapper");
        const toggleButton = document.getElementById("menu-toggle");
        toggleButton.onclick = function () {
            el.classList.toggle("toggled");
        };
    };

    $scope.setTab = function(tab) {
        $scope.activeTab = tab;
        if (tab === 'dashboard') {
            $timeout($scope.updateChart, 100);
        }
    };

    $scope.fetchStudents = function() {
        $http.get('/api/students').then(function(response) {
            $scope.students = response.data;
            $scope.calculateStats();
            $scope.updateChart();
        });
    };

    $scope.calculateStats = function() {
        if ($scope.students.length === 0) {
            $scope.stats = { totalStudents: 0, totalBranches: 0, avgSemester: 0, maxSemester: 0, minSemester: 0 };
            return;
        }

        const sems = $scope.students.map(s => parseInt(s.semester));
        const uniqueBranches = new Set($scope.students.map(s => s.branch));

        $scope.stats.totalStudents = $scope.students.length;
        $scope.stats.totalBranches = uniqueBranches.size;
        $scope.stats.avgSemester = sems.reduce((a, b) => a + b, 0) / sems.length;
        $scope.stats.maxSemester = Math.max(...sems);
        $scope.stats.minSemester = Math.min(...sems);
    };

    // Chart logic
    let myChart = null;
    $scope.updateChart = function() {
        const ctx = document.getElementById('branchChart');
        if (!ctx) return;

        const branchCounts = {};
        $scope.branches.forEach(b => branchCounts[b] = 0);
        $scope.students.forEach(s => {
            if (branchCounts[s.branch] !== undefined) branchCounts[s.branch]++;
        });

        const data = {
            labels: Object.keys(branchCounts),
            datasets: [{
                label: 'Students per Branch',
                data: Object.values(branchCounts),
                backgroundColor: [
                    'rgba(78, 115, 223, 0.7)',
                    'rgba(28, 200, 138, 0.7)',
                    'rgba(54, 185, 204, 0.7)',
                    'rgba(246, 194, 62, 0.7)',
                    'rgba(231, 74, 59, 0.7)',
                    'rgba(133, 135, 150, 0.7)'
                ],
                borderRadius: 8
            }]
        };

        if (myChart) myChart.destroy();
        myChart = new Chart(ctx, {
            type: 'bar',
            data: data,
            options: {
                responsive: true,
                scales: {
                    y: { beginAtZero: true, ticks: { stepSize: 1 } }
                },
                plugins: {
                    legend: { display: false }
                }
            }
        });
    };

    // CRUD
    $scope.openAddModal = function() {
        $scope.isEditing = false;
        $scope.currentStudent = { branch: '', semester: '' };
        const modal = new bootstrap.Modal(document.getElementById('studentModal'));
        modal.show();
    };

    $scope.openEditModal = function(student) {
        $scope.isEditing = true;
        $scope.currentStudent = angular.copy(student);
        const modal = new bootstrap.Modal(document.getElementById('studentModal'));
        modal.show();
    };

    $scope.saveStudent = function() {
        if ($scope.isEditing) {
            $http.put('/api/students/' + $scope.currentStudent.id, $scope.currentStudent).then(function() {
                $scope.fetchStudents();
                $scope.showToast('Student updated successfully!');
                bootstrap.Modal.getInstance(document.getElementById('studentModal')).hide();
            });
        } else {
            $http.post('/api/students', $scope.currentStudent).then(function() {
                $scope.fetchStudents();
                $scope.showToast('Student added successfully!');
                bootstrap.Modal.getInstance(document.getElementById('studentModal')).hide();
            });
        }
    };

    $scope.deleteStudent = function(student) {
        if (confirm('Are you sure you want to delete ' + student.name + '?')) {
            $http.delete('/api/students/' + student.id).then(function() {
                $scope.fetchStudents();
                $scope.showToast('Student deleted successfully!');
            });
        }
    };

    // UI Helpers
    $scope.getBranchBadgeClass = function(branch) {
        const classes = {
            'Computer Science': 'bg-primary',
            'Electronics': 'bg-success',
            'Mechanical': 'bg-warning text-dark',
            'Civil': 'bg-info text-dark',
            'Information Science': 'bg-danger',
            'Electrical': 'bg-secondary'
        };
        return classes[branch] || 'bg-dark';
    };

    $scope.showToast = function(msg) {
        $scope.toastMessage = msg;
        const toastEl = document.getElementById('liveToast');
        const toast = new bootstrap.Toast(toastEl);
        toast.show();
    };

    $scope.exportCSV = function() {
        let csv = 'Name,USN,Branch,Semester\n';
        $scope.students.forEach(s => {
            csv += `${s.name},${s.usn},${s.branch},${s.semester}\n`;
        });
        
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.setAttribute('hidden', '');
        a.setAttribute('href', url);
        a.setAttribute('download', 'students.csv');
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        $scope.showToast('Exported to CSV successfully!');
    };

    $scope.init();
});
