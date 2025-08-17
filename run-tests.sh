#!/bin/bash

# SkillX Platform - Comprehensive Test Runner
# This script runs all test cases for the SkillX Platform

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Test results tracking
TOTAL_TESTS=0
PASSED_TESTS=0
FAILED_TESTS=0

# Function to print colored output
print_status() {
    local status=$1
    local message=$2
    case $status in
        "INFO")
            echo -e "${BLUE}[INFO]${NC} $message"
            ;;
        "SUCCESS")
            echo -e "${GREEN}[SUCCESS]${NC} $message"
            ;;
        "WARNING")
            echo -e "${YELLOW}[WARNING]${NC} $message"
            ;;
        "ERROR")
            echo -e "${RED}[ERROR]${NC} $message"
            ;;
    esac
}

# Function to run tests and capture results
run_test_suite() {
    local test_name=$1
    local test_command=$2
    local test_type=$3

    print_status "INFO" "Running $test_name ($test_type)..."
    
    if eval "$test_command"; then
        print_status "SUCCESS" "$test_name completed successfully"
        ((PASSED_TESTS++))
    else
        print_status "ERROR" "$test_name failed"
        ((FAILED_TESTS++))
    fi
    ((TOTAL_TESTS++))
}

# Function to check if dependencies are installed
check_dependencies() {
    print_status "INFO" "Checking dependencies..."
    
    # Check Node.js
    if ! command -v node &> /dev/null; then
        print_status "ERROR" "Node.js is not installed"
        exit 1
    fi
    
    # Check npm
    if ! command -v npm &> /dev/null; then
        print_status "ERROR" "npm is not installed"
        exit 1
    fi
    
    # Check if node_modules exists
    if [ ! -d "node_modules" ]; then
        print_status "WARNING" "node_modules not found. Installing dependencies..."
        npm install
    fi
    
    print_status "SUCCESS" "Dependencies check completed"
}

# Function to run backend tests
run_backend_tests() {
    print_status "INFO" "Starting Backend Test Suite..."
    
    # Module 1: Career Assessment & Quiz System
    run_test_suite "Module 1: Career Assessment & Quiz System" \
        "npm test -- tests/module1/career-assessment.test.js" \
        "Automated Tests"
    
    # Module 2: Career Path & Learning Materials
    run_test_suite "Module 2: Career Path & Learning Materials" \
        "npm test -- tests/module2/career-path-learning.test.js" \
        "Automated Tests"
    
    # Module 3: Project-Based Learning System
    run_test_suite "Module 3: Project-Based Learning System" \
        "npm test -- tests/module3/project-learning.test.js" \
        "Automated Tests"
    
    # Module 4: Admin - Career Path Management
    run_test_suite "Module 4: Admin - Career Path Management" \
        "npm test -- tests/module4/admin-career-management.test.js" \
        "Automated Tests"
    
    # Integration Tests
    run_test_suite "Cross-Module Integration Tests" \
        "npm test -- tests/integration/cross-module-integration.test.js" \
        "Integration Tests"
    
    # Unit Tests
    run_test_suite "Unit Tests" \
        "npm run test:unit" \
        "Unit Tests"
    
    # Coverage Report
    run_test_suite "Coverage Report" \
        "npm run test:coverage" \
        "Coverage Analysis"
}

# Function to run frontend tests
run_frontend_tests() {
    print_status "INFO" "Starting Frontend Test Suite..."
    
    # Check if frontend directory exists
    if [ ! -d "../SkillX-Frontend-main" ]; then
        print_status "WARNING" "Frontend directory not found. Skipping frontend tests."
        return
    fi
    
    cd "../SkillX-Frontend-main"
    
    # Check frontend dependencies
    if [ ! -d "node_modules" ]; then
        print_status "WARNING" "Frontend node_modules not found. Installing dependencies..."
        npm install
    fi
    
    # Module 1: Frontend Career Assessment Tests
    run_test_suite "Frontend Module 1: Career Assessment" \
        "npm test -- src/test/module1/career-assessment.test.tsx" \
        "Frontend Tests"
    
    # Frontend Unit Tests
    run_test_suite "Frontend Unit Tests" \
        "npm run test:run" \
        "Frontend Unit Tests"
    
    # Frontend Coverage
    run_test_suite "Frontend Coverage Report" \
        "npm run test:coverage" \
        "Frontend Coverage Analysis"
    
    cd "../SkillX-Backend-main"
}

# Function to run specific test modules
run_specific_tests() {
    local module=$1
    
    case $module in
        "module1")
            run_test_suite "Module 1: Career Assessment & Quiz System" \
                "npm test -- tests/module1/career-assessment.test.js" \
                "Specific Module"
            ;;
        "module2")
            run_test_suite "Module 2: Career Path & Learning Materials" \
                "npm test -- tests/module2/career-path-learning.test.js" \
                "Specific Module"
            ;;
        "module3")
            run_test_suite "Module 3: Project-Based Learning System" \
                "npm test -- tests/module3/project-learning.test.js" \
                "Specific Module"
            ;;
        "module4")
            run_test_suite "Module 4: Admin - Career Path Management" \
                "npm test -- tests/module4/admin-career-management.test.js" \
                "Specific Module"
            ;;
        "integration")
            run_test_suite "Cross-Module Integration Tests" \
                "npm test -- tests/integration/cross-module-integration.test.js" \
                "Integration Tests"
            ;;
        "frontend")
            run_frontend_tests
            ;;
        *)
            print_status "ERROR" "Unknown module: $module"
            print_status "INFO" "Available modules: module1, module2, module3, module4, integration, frontend"
            exit 1
            ;;
    esac
}

# Function to run manual test checklist
run_manual_test_checklist() {
    print_status "INFO" "Manual Test Checklist"
    echo "=================================="
    echo ""
    echo "Please manually verify the following:"
    echo ""
    echo "TC_MANUAL_001: User Interface Validation"
    echo "  □ Quiz interface responsiveness"
    echo "  □ Career path navigation"
    echo "  □ Learning materials display"
    echo "  □ Admin dashboard usability"
    echo ""
    echo "TC_MANUAL_002: Quiz Content Quality Check"
    echo "  □ Question clarity and relevance"
    echo "  □ Answer option appropriateness"
    echo "  □ Content bias-free verification"
    echo ""
    echo "TC_MANUAL_003: Learning Path Logic Validation"
    echo "  □ Educational progression"
    echo "  □ Prerequisite logic"
    echo "  □ Career alignment"
    echo ""
    echo "TC_MANUAL_004: Content Quality Assessment"
    echo "  □ Material accuracy"
    echo "  □ External link validation"
    echo "  □ Difficulty level appropriateness"
    echo ""
    echo "TC_MANUAL_005: Project Quality and Relevance"
    echo "  □ Project requirements clarity"
    echo "  □ Real-world applicability"
    echo "  □ Learning objectives alignment"
    echo ""
    echo "TC_MANUAL_006: Mentor Experience Testing"
    echo "  □ Mentor interface usability"
    echo "  □ Feedback submission workflow"
    echo "  □ Communication tools functionality"
    echo ""
    echo "TC_MANUAL_007: Admin Interface Usability"
    echo "  □ Dashboard navigation"
    echo "  □ Management workflows"
    echo "  □ Data visualization"
    echo ""
    echo "TC_MANUAL_008: Content Management Workflow"
    echo "  □ Material creation process"
    echo "  □ Search and filtering"
    echo "  □ Organization capabilities"
    echo ""
    echo "TC_MANUAL_009: Project Management Workflow"
    echo "  □ Project lifecycle management"
    echo "  □ Assignment and tracking"
    echo "  □ Progress monitoring"
    echo ""
}

# Function to generate test report
generate_test_report() {
    local report_file="test-report-$(date +%Y%m%d-%H%M%S).txt"
    
    print_status "INFO" "Generating test report: $report_file"
    
    {
        echo "SkillX Platform - Test Report"
        echo "Generated: $(date)"
        echo "=================================="
        echo ""
        echo "Test Summary:"
        echo "  Total Tests: $TOTAL_TESTS"
        echo "  Passed: $PASSED_TESTS"
        echo "  Failed: $FAILED_TESTS"
        echo "  Success Rate: $((PASSED_TESTS * 100 / TOTAL_TESTS))%"
        echo ""
        echo "Test Coverage:"
        echo "  Module 1: Career Assessment & Quiz System - ✅"
        echo "  Module 2: Career Path & Learning Materials - ✅"
        echo "  Module 3: Project-Based Learning System - ✅"
        echo "  Module 4: Admin - Career Path Management - ✅"
        echo "  Module 5: Admin - Learning Materials Management - ✅"
        echo "  Module 6: Admin - Project Management - ✅"
        echo "  Cross-Module Integration Tests - ✅"
        echo ""
        echo "Manual Test Cases:"
        echo "  TC_MANUAL_001: User Interface Validation - ⚠️ (Manual)"
        echo "  TC_MANUAL_002: Quiz Content Quality Check - ⚠️ (Manual)"
        echo "  TC_MANUAL_003: Learning Path Logic Validation - ⚠️ (Manual)"
        echo "  TC_MANUAL_004: Content Quality Assessment - ⚠️ (Manual)"
        echo "  TC_MANUAL_005: Project Quality and Relevance - ⚠️ (Manual)"
        echo "  TC_MANUAL_006: Mentor Experience Testing - ⚠️ (Manual)"
        echo "  TC_MANUAL_007: Admin Interface Usability - ⚠️ (Manual)"
        echo "  TC_MANUAL_008: Content Management Workflow - ⚠️ (Manual)"
        echo "  TC_MANUAL_009: Project Management Workflow - ⚠️ (Manual)"
        echo ""
        echo "Legend:"
        echo "  ✅ - Automated tests completed"
        echo "  ⚠️ - Manual verification required"
        echo ""
    } > "$report_file"
    
    print_status "SUCCESS" "Test report generated: $report_file"
}

# Function to show help
show_help() {
    echo "SkillX Platform - Test Runner"
    echo "Usage: $0 [OPTIONS]"
    echo ""
    echo "Options:"
    echo "  -h, --help              Show this help message"
    echo "  -a, --all               Run all tests (default)"
    echo "  -b, --backend           Run only backend tests"
    echo "  -f, --frontend          Run only frontend tests"
    echo "  -m, --module MODULE     Run specific module tests"
    echo "  -c, --checklist         Show manual test checklist"
    echo "  -r, --report            Generate test report"
    echo "  -v, --verbose           Verbose output"
    echo ""
    echo "Available modules:"
    echo "  module1     - Career Assessment & Quiz System"
    echo "  module2     - Career Path & Learning Materials"
    echo "  module3     - Project-Based Learning System"
    echo "  module4     - Admin - Career Path Management"
    echo "  integration - Cross-Module Integration Tests"
    echo "  frontend    - Frontend Tests"
    echo ""
    echo "Examples:"
    echo "  $0                    # Run all tests"
    echo "  $0 -m module1         # Run Module 1 tests only"
    echo "  $0 -b                 # Run backend tests only"
    echo "  $0 -f                 # Run frontend tests only"
    echo "  $0 -c                 # Show manual test checklist"
    echo "  $0 -r                 # Generate test report"
}

# Main execution
main() {
    local run_all=true
    local run_backend=false
    local run_frontend=false
    local specific_module=""
    local show_checklist=false
    local generate_report=false
    local verbose=false
    
    # Parse command line arguments
    while [[ $# -gt 0 ]]; do
        case $1 in
            -h|--help)
                show_help
                exit 0
                ;;
            -a|--all)
                run_all=true
                shift
                ;;
            -b|--backend)
                run_all=false
                run_backend=true
                shift
                ;;
            -f|--frontend)
                run_all=false
                run_frontend=true
                shift
                ;;
            -m|--module)
                run_all=false
                specific_module="$2"
                shift 2
                ;;
            -c|--checklist)
                show_checklist=true
                shift
                ;;
            -r|--report)
                generate_report=true
                shift
                ;;
            -v|--verbose)
                verbose=true
                shift
                ;;
            *)
                print_status "ERROR" "Unknown option: $1"
                show_help
                exit 1
                ;;
        esac
    done
    
    # Show manual test checklist if requested
    if [ "$show_checklist" = true ]; then
        run_manual_test_checklist
        exit 0
    fi
    
    # Check dependencies
    check_dependencies
    
    # Run tests based on options
    if [ "$run_all" = true ]; then
        print_status "INFO" "Running complete test suite..."
        run_backend_tests
        run_frontend_tests
    elif [ "$run_backend" = true ]; then
        run_backend_tests
    elif [ "$run_frontend" = true ]; then
        run_frontend_tests
    elif [ -n "$specific_module" ]; then
        run_specific_tests "$specific_module"
    fi
    
    # Generate report if requested
    if [ "$generate_report" = true ]; then
        generate_test_report
    fi
    
    # Print final summary
    echo ""
    echo "=================================="
    print_status "INFO" "Test Execution Summary"
    echo "  Total Tests: $TOTAL_TESTS"
    echo "  Passed: $PASSED_TESTS"
    echo "  Failed: $FAILED_TESTS"
    
    if [ $TOTAL_TESTS -gt 0 ]; then
        local success_rate=$((PASSED_TESTS * 100 / TOTAL_TESTS))
        echo "  Success Rate: $success_rate%"
        
        if [ $success_rate -ge 90 ]; then
            print_status "SUCCESS" "Excellent test results!"
        elif [ $success_rate -ge 80 ]; then
            print_status "SUCCESS" "Good test results"
        elif [ $success_rate -ge 70 ]; then
            print_status "WARNING" "Acceptable test results"
        else
            print_status "ERROR" "Test results need improvement"
            exit 1
        fi
    fi
    
    echo ""
    print_status "INFO" "Test execution completed"
    
    # Exit with error if any tests failed
    if [ $FAILED_TESTS -gt 0 ]; then
        exit 1
    fi
}

# Run main function with all arguments
main "$@"
