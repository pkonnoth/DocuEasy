import { ChatInput } from '@/cedar/components/chatInput/ChatInput';
import ChatBubbles from '@/cedar/components/chatMessages/ChatBubbles';
import { CollapsedButton } from '@/cedar/components/chatMessages/structural/CollapsedChatButton';
import Container3D from '@/cedar/components/containers/Container3D';
import { FloatingContainer } from '@/cedar/components/structural/FloatingContainer';
import { useCedarStore, useThreadController } from 'cedar-os';
import { ChatThreadController } from '@/cedar/components/threads/ChatThreadController';
import { X } from 'lucide-react';
import { AnimatePresence } from 'motion/react';
import React, { useEffect, useRef } from 'react';
interface FloatingCedarChatProps {
	side?: 'left' | 'right';
	title?: string;
	collapsedLabel?: string;
	companyLogo?: React.ReactNode;
	dimensions?: {
		width?: number;
		height?: number;
		minWidth?: number;
		minHeight?: number;
		maxWidth?: number;
		maxHeight?: number;
	};
	resizable?: boolean;
	showThreadController?: boolean;
	stream?: boolean; // Whether to use streaming for responses
	patientContext?: {
		patientId: string;
		patientName: string;
		patientAge?: number;
		currentMedications?: number;
		recentEncounters?: number;
	};
}

export const FloatingCedarChat: React.FC<FloatingCedarChatProps> = ({
	side = 'right',
	title,
	collapsedLabel,
	companyLogo,
	dimensions = {
		minWidth: 350,
		minHeight: 400,
	},
	showThreadController = false,
	resizable = true,
	stream = true,
	patientContext,
}) => {
	// Generate patient-specific title and label
	const chatTitle = title || (patientContext ? `Chat: ${patientContext.patientName}` : 'Cedar Chat');
	const chatLabel = collapsedLabel || (patientContext 
		? `Ask about ${patientContext.patientName.split(' ')[0]}'s care...` 
		: 'How can I help you today?'
	);
	// Get Cedar store state and actions
	const showChat = useCedarStore((state) => state.showChat);
	const setShowChat = useCedarStore((state) => state.setShowChat);
	
	// Get thread management functions
	const { currentThreadId, createThread, switchThread } = useThreadController();
	
	// Create thread-specific chat for each patient
	useEffect(() => {
		if (patientContext?.patientId) {
			const patientThreadId = `patient-${patientContext.patientId}`;
			const threadName = `${patientContext.patientName} Chat`;
			
			console.log('🧵 Setting up thread for patient:', patientContext.patientName, 'Thread ID:', patientThreadId.substring(0, 20) + '...');
			
			// Create thread if it doesn't exist, then switch to it
			createThread(patientThreadId, threadName);
			switchThread(patientThreadId, threadName);
		}
	}, [patientContext?.patientId, patientContext?.patientName, createThread, switchThread]);

	return (
		<div key={`patient-chat-${patientContext?.patientId || 'default'}`}>
			<AnimatePresence mode='wait'>
				{!showChat && (
					<CollapsedButton
						side={side}
						label={chatLabel}
						layoutId={`cedar-floating-chat-${patientContext?.patientId || 'default'}`}
						position='fixed'
					/>
				)}
			</AnimatePresence>

			<FloatingContainer
				isActive={showChat}
				position={side === 'left' ? 'bottom-left' : 'bottom-right'}
				dimensions={dimensions}
				resizable={resizable}
				className='cedar-floating-chat'
				key={`chat-${patientContext?.patientId || 'default'}`}>
				<Container3D className='flex flex-col h-full text-sm'>
					{/* Header */}
					<div>
						<div className='flex-shrink-0 z-20 flex flex-row items-center justify-between px-3 py-2 min-w-0 border-b border-gray-200 dark:border-gray-700'>
							<div className='flex items-center min-w-0 flex-1'>
								{companyLogo && (
									<div className='flex-shrink-0 w-6 h-6 mr-2'>
										{companyLogo}
									</div>
								)}
								<div className='flex flex-col min-w-0'>
									<span className='font-bold text-lg truncate'>{chatTitle}</span>
									{patientContext && (
										<span className='text-xs text-gray-500 truncate'>
											Age {patientContext.patientAge} • {patientContext.patientId.substring(0, 8)}...
										</span>
									)}
									<span className='text-xs text-blue-500 truncate'>
										Thread: {currentThreadId.substring(0, 15)}...
									</span>
								</div>
							</div>
							<div className='flex items-center gap-1 flex-shrink-0'>
								{showThreadController && <ChatThreadController />}
								<button
									className='p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md transition-colors'
									onClick={() => setShowChat(false)}
									aria-label='Close chat'>
									<X className='h-4 w-4' strokeWidth={2.5} />
								</button>
							</div>
						</div>
					</div>

					{/* Chat messages - takes up remaining space */}
					<div className='flex-1 min-h-0 overflow-hidden'>
						<ChatBubbles key={`bubbles-${patientContext?.patientId || 'default'}`} />
					</div>

					{/* Chat input - fixed at bottom */}
					<div className='flex-shrink-0 p-3'>
						<ChatInput
							key={`input-${patientContext?.patientId || 'default'}`}
							handleFocus={() => {}}
							handleBlur={() => {}}
							isInputFocused={false}
							stream={stream}
						/>
					</div>
				</Container3D>
			</FloatingContainer>
		</div>
	);
};
